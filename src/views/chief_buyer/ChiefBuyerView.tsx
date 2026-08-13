import React, { useState, useEffect } from "react";
import { UserProfile } from "../../hooks/useAuth";
import { Card, Button, Toast } from "../../components/UI";
import { LogOut, LayoutGrid, Users, Filter, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../firebase";
import { useTranslation } from "react-i18next";

interface AggregatedItem {
  id: string;
  name: string;
  totalQuantity: number;
  ordersCount: number;
  category: string;
  unit: string;
}

export default function ChiefBuyerView({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("batching");
  const [aggregatedItems, setAggregatedItems] = useState<AggregatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Orders that are confirmed and ready for purchase
    const q = query(
      collection(db, "orders"),
      where("agencyId", "==", profile.agencyId || "agency_ouando"),
      where("status", "==", "confirmed")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const itemsMap: Record<string, AggregatedItem> = {};
      
      for (const orderDoc of snapshot.docs) {
        const itemsSnap = await getDocs(collection(db, `orders/${orderDoc.id}/items`));
        itemsSnap.docs.forEach(itemDoc => {
          const item = itemDoc.data();
          if (item.status === "pending") {
            const key = `${item.name}-${item.category}`;
            if (!itemsMap[key]) {
              itemsMap[key] = {
                id: itemDoc.id,
                name: item.name,
                category: item.category,
                totalQuantity: 0,
                ordersCount: 0,
                unit: item.quantity.replace(/[0-9.]/g, '').trim() || t('common.units', { defaultValue: 'Unités' })
              };
            }
            
            // Extract numeric part for sum
            const qtyNum = parseFloat(item.quantity) || 1;
            itemsMap[key].totalQuantity += qtyNum;
            itemsMap[key].ordersCount += 1;
          }
        });
      }
      
      setAggregatedItems(Object.values(itemsMap));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile.agencyId]);

  const handleDispatch = async () => {
    if (aggregatedItems.length === 0) return;
    setIsDispatching(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("agencyId", "==", profile.agencyId || "agency_ouando"),
        where("status", "==", "confirmed")
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      
      snap.docs.forEach((orderDoc) => {
        batch.update(orderDoc.ref, { 
          status: "buying",
          updatedAt: serverTimestamp() 
        });
      });
      
      await batch.commit();
      setToast({
        message: t('chief_buyer.alert_dispatch', { count: snap.docs.length, defaultValue: `Procédure d'achat lancée pour ${snap.docs.length} commandes.` }),
        type: "success",
      });
    } catch (err) {
      console.error("Dispatch failed", err);
      setToast({ message: "Échec du dispatch", type: "error" });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-2">
            {t('chief_buyer.role_title')} • {profile.agencyId}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t('chief_buyer.title')}</h1>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <NavBtn active={activeTab === "batching"} label={t('chief_buyer.batching')} onClick={() => setActiveTab("batching")} />
          <NavBtn active={activeTab === "sorting"} label={t('chief_buyer.sorting')} onClick={() => setActiveTab("sorting")} />
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-400 hover:text-red-500 rounded-xl">
           <LogOut size={20} />
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Aggregated Matrix */}
        <div className="col-span-2 space-y-6">
          <Card className="p-8 border-none shadow-md">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-serif italic text-gray-700">{t('chief_buyer.consolidation_matrix')}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t('chief_buyer.regroup_desc')}</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="gap-2"><Filter size={14} /> {t('common.zone', { defaultValue: "Zone" })}</Button>
                <Button 
                  onClick={handleDispatch} 
                  loading={isDispatching}
                  disabled={aggregatedItems.length === 0}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl gap-2 h-10 px-6 font-bold text-xs uppercase tracking-widest"
                >
                  <CheckCircle2 size={16} /> {t('chief_buyer.launch_purchase')}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse font-serif italic">{t('chief_buyer.consolidating')}</div>
              ) : aggregatedItems.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-serif italic border-2 border-dashed border-gray-100 rounded-3xl">
                  {t('chief_buyer.no_needs')}
                </div>
              ) : (
                aggregatedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl bg-[#F9F9F7] border border-transparent hover:border-gray-200 transition-all group">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg font-bold text-gray-400">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-[#2563EB] uppercase tracking-widest font-bold">{item.category}</p>
                      <p className="text-xl font-bold text-[#1A1A1A]">{item.name}</p>
                    </div>
                    <div className="text-right px-8 border-x border-gray-100">
                      <p className="text-2xl font-black text-[#1A1A1A]">{item.totalQuantity} <span className="text-xs font-normal text-gray-400">{item.unit}</span></p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{t('common.orders_count', { count: item.ordersCount, defaultValue: `${item.ordersCount} commandes` })}</p>
                    </div>
                    <Button variant="outline" size="icon" className="group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors border-none shadow-sm">
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Buyers */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-md bg-[#141414] text-white">
            <h3 className="text-xl font-serif mb-6 text-gray-300">{t('chief_buyer.online_buyers')}</h3>
            <div className="space-y-4">
              <BuyerItem name="Kossi A." status={t('buyer.status.on_field', { defaultValue: "Sur le terrain" })} items={8} t={t} />
              <BuyerItem name="Moussa B." status={t('buyer.status.waiting', { defaultValue: "En attente" })} items={0} active t={t} />
              <BuyerItem name="Saliou K." status={t('buyer.status.reconciliation', { defaultValue: "Reconciliation" })} items={12} t={t} />
            </div>
          </Card>

          <Card className="p-8 border-none shadow-md">
            <h3 className="text-xl font-serif mb-4">{t('chief_buyer.treasury_summary')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{t('chief_buyer.total_allocated')}</span>
                <span className="text-sm font-bold">{formatCurrency(245000)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50 text-green-600">
                <span className="text-sm">{t('chief_buyer.estimated_restitution')}</span>
                <span className="text-sm font-bold">~ {formatCurrency(12000)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

function NavBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-xl text-sm font-medium transition-all",
        active ? "bg-[#141414] text-white shadow-lg" : "text-gray-500 hover:text-gray-800"
      )}
    >
      {label}
    </button>
  );
}

function BuyerItem({ name, status, items, active = false, t }: { name: string; status: string; items: number; active?: boolean; t: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold", active ? "bg-green-500 text-white" : "bg-white/10 text-white/40")}>
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{name}</p>
        <p className={cn("text-[10px] font-bold uppercase", status === t('buyer.status.waiting', { defaultValue: "En attente" }) ? "text-green-500" : "text-gray-500")}>{status}</p>
      </div>
      {items > 0 && <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full font-bold">{t('common.items_count', { count: items, defaultValue: `${items} items` })}</span>}
    </div>
  );
}
