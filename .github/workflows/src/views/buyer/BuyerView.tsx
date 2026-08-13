import React, { useState, useEffect } from "react";
import { UserProfile } from "../../hooks/useAuth";
import { Card, Button, Input } from "../../components/UI";
import { LogOut, Camera, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";


import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import { markItemAsBought, markItemUnavailable } from "../../services/buyerService";

export default function BuyerView({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all confirmed or buying orders for this agency
    const q = query(
      collection(db, "orders"),
      where("agencyId", "==", profile.agencyId || "agency_ouando"),
      where("status", "in", ["confirmed", "buying"])
    );

    const unsubOrders = onSnapshot(q, async (snap) => {
      const allItems: any[] = [];
      
      for (const orderDoc of snap.docs) {
        const itemsSnap = await getDocs(collection(db, `orders/${orderDoc.id}/items`));
        itemsSnap.docs.forEach(itemDoc => {
          const item = itemDoc.data();
          if (item.status === 'pending' || item.status === 'buying') {
            allItems.push({
              id: itemDoc.id,
              orderId: orderDoc.id,
              ...item
            });
          }
        });
      }
      
      setTasks(allItems);
      setLoading(false);
    });

    return () => unsubOrders();
  }, [profile.agencyId]);

  const handleAction = async (status: 'bought' | 'unavailable') => {
    if (!selectedTask) return;
    try {
      if (status === 'bought') {
        await markItemAsBought(selectedTask.orderId, selectedTask.id, selectedTask.estimatedBudget);
      } else {
        await markItemUnavailable(selectedTask.orderId, selectedTask.id);
      }
      setSelectedTask(null);
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9F9F7] max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <header className="p-6 bg-[#1A1A1A] text-white shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{t('buyer.title')}</h1>
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className="text-gray-400 hover:text-white mr-2"><LogOut size={16} /></button>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span className="text-[10px] font-extrabold uppercase text-gray-400">{t('buyer.field_mode')}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Card className="flex-1 p-3 bg-white/10 border-none text-center rounded-xl">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('buyer.to_buy')}</p>
            <p className="text-xl font-bold">{tasks.length}</p>
          </Card>
          <Card className="flex-1 p-3 bg-white/10 border-none text-center rounded-xl">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('buyer.agency')}</p>
            <p className="text-sm font-bold text-blue-400">{profile.agencyId || "Ouando"}</p>
          </Card>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map(task => (
          <motion_div key={task.id} onClick={() => setSelectedTask(task)}>
            <Card className={cn(
              "p-4 flex justify-between items-center transition-all active:scale-[0.98]",
              task.status === "completed" ? "opacity-50" : "cursor-pointer"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  task.status !== "pending" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                )}>
                  {task.status !== "pending" ? <CheckCircle2 /> : <span className="font-bold text-lg">{task.name.charAt(0)}</span>}
                </div>
                <div>
                  <h3 className="font-medium">{task.name}</h3>
                  <p className="text-xs text-gray-500">{t('buyer.quantity')} <span className="font-bold text-[#5A5A40] underline">{task.quantity}</span></p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Card>
          </motion_div>
        ))}
      </main>

      {/* Action Modal (simplified) */}
      {selectedTask && (
        <div className="absolute inset-0 bg-[#F9F9F7] z-[60] flex flex-col items-center justify-center p-8">
          <button className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full" onClick={() => setSelectedTask(null)}>×</button>
          
          <div className="w-full text-center space-y-6">
            <div className="w-24 h-24 bg-[#5A5A40] text-white rounded-[2rem] flex items-center justify-center mx-auto text-4xl mb-6">
              {selectedTask.name.charAt(0)}
            </div>
            <h2 className="text-4xl font-serif">{selectedTask.name}</h2>
            <p className="text-gray-500 italic font-serif">{t('buyer.confirm_acquisition')} <span className="text-black font-bold not-italic">{selectedTask.quantity}</span></p>
            
            <div className="space-y-4 pt-12">
              <Button className="w-full h-16 rounded-2xl text-xl gap-3 bg-green-600" onClick={() => handleAction('bought')}>
                <CheckCircle2 size={24} /> {t('common.validate_purchase', { defaultValue: "Valider l'Achat" })}
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 rounded-2xl gap-2 font-bold text-orange-600 border-orange-200">
                  <RefreshCw size={20} /> {t('common.substitution', { defaultValue: "Substitution" })}
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl gap-2 font-bold text-red-600 border-red-200" onClick={() => handleAction('unavailable')}>
                  <AlertCircle size={20} /> {t('common.out_of_stock', { defaultValue: "Rupture" })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const motion_div = ({ children, onClick }: any) => <div onClick={onClick} className="cursor-pointer">{children}</div>;
