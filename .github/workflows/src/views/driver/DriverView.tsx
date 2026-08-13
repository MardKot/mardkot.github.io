import React, { useState, useEffect } from "react";
import { UserProfile } from "../../hooks/useAuth";
import { Card, Button } from "../../components/UI";
import { LogOut, MapPin, Navigation, Phone, CheckCircle2, ChevronRight, PackageCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";


import { 
  collection, 
  onSnapshot, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "../../firebase";
import { completeDelivery, startDelivery, updateDeliveryLocation } from "../../services/driverService";
import { motion } from "motion/react";

export default function DriverView({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("agencyId", "==", profile.agencyId || "agency_ouando"),
      where("status", "in", ["sorting", "delivering"])
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeliveries(data);
      if (activeDelivery) {
        const updated = data.find(d => d.id === activeDelivery.id);
        if (updated) setActiveDelivery(updated);
      }
    });
  }, [profile.agencyId, activeDelivery?.id]);

  useEffect(() => {
    let interval: any;
    if (activeDelivery && activeDelivery.status === 'delivering') {
      interval = setInterval(() => {
        // Simple simulation: move location slightly
        const newLat = (activeDelivery.tracking?.lat || 6.37) + (Math.random() - 0.5) * 0.001;
        const newLng = (activeDelivery.tracking?.lng || 2.44) + (Math.random() - 0.5) * 0.001;
        updateDeliveryLocation(activeDelivery.id, newLat, newLng, "delivering");
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeDelivery?.id, activeDelivery?.status]);

  const handleStartDelivery = async () => {
    if (!activeDelivery) return;
    setIsProcessing(true);
    try {
      await startDelivery(activeDelivery.id);
      await updateDeliveryLocation(activeDelivery.id, 6.3703, 2.4451, "delivering");
    } catch (err) {
      console.error("Start delivery failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!activeDelivery) return;
    setIsProcessing(true);
    try {
      await completeDelivery(activeDelivery.id);
      setActiveDelivery(null);
    } catch (err) {
      console.error("Delivery completion failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeDelivery) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto overflow-hidden relative">
        {/* Mock Map Background */}
        <div className="flex-1 bg-blue-50 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
          <div className="relative z-10 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F27D26] rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce">
              <Navigation className="w-8 h-8 rotate-45" />
            </div>
            <p className="text-gray-400 font-serif italic text-sm">{t('driver.navigation_active', { client: activeDelivery.client || activeDelivery.clientId.slice(0, 6) })}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="absolute top-6 left-6 rounded-full bg-white shadow-xl"
            onClick={() => setActiveDelivery(null)}
          >
            ← {t('common.back', { defaultValue: "Retour" })}
          </Button>
        </div>

        <Card className="relative z-20 -mt-10 rounded-t-[3rem] p-8 space-y-8 bg-white shadow-2xl border-none">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-serif">{activeDelivery.client || `Client #${activeDelivery.clientId.slice(0, 5)}`}</h2>
              <a
                href={`tel:${activeDelivery.clientPhone || ''}`}
                className="bg-green-500 rounded-full h-12 w-12 shadow-lg hover:bg-green-600 flex items-center justify-center text-white"
                aria-label="Appeler le client"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
            <p className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4 text-brand" />
              {activeDelivery.address || activeDelivery.deliveryAddress}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {activeDelivery.status === 'sorting' ? (
              <Button
                className="col-span-2 h-14 rounded-2xl gap-2 font-bold bg-blue-600 hover:bg-blue-700"
                onClick={handleStartDelivery}
                loading={isProcessing}
              >
                {t('driver.start_delivery')}
              </Button>
            ) : (
              <>
                <a
                  href={`tel:${activeDelivery.clientPhone || ''}`}
                  className="h-14 rounded-2xl flex items-center justify-center gap-2 font-bold bg-[#F9F9F7] border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  {t('driver.call_client')}
                </a>
                <a
                  href={`sms:${activeDelivery.clientPhone || ''}?body=${encodeURIComponent("Bonjour, je suis votre livreur Porto Market. Je suis en route.")}`}
                  className="h-14 rounded-2xl flex items-center justify-center gap-2 font-bold bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  {t('driver.sms_sent')}
                </a>
              </>
            )}
          </div>

          <Button 
            className="w-full h-20 rounded-3xl text-xl gap-4 bg-[#141414]"
            onClick={handleComplete}
            loading={isProcessing}
          >
            <PackageCheck size={28} /> {t('common.validate_delivery', { defaultValue: "Valider la Livraison" })}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="p-8 pb-12 shrink-0 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{t('driver.title')}</h1>
          <p className="text-gray-500 font-medium italic text-sm">{t('driver.parzels_to_deliver', { count: deliveries.length })}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-400 hover:text-red-500">
           <LogOut size={20} />
        </Button>
      </header>

      <main className="flex-1 -mt-6 bg-white rounded-t-[2.5rem] p-8 space-y-4 overflow-hidden border-t border-gray-100 shadow-xl overflow-y-auto">
        {deliveries.length === 0 ? (
          <div className="py-20 text-center text-gray-400 italic">{t('driver.no_deliveries')}</div>
        ) : (
          deliveries.map(delivery => (
            <motion_div key={delivery.id} onClick={() => setActiveDelivery(delivery)}>
              <Card className="p-6 border-gray-100 bg-gray-50 active:scale-95 transition-all hover:border-[#2563EB] border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold border border-gray-100 italic">
                      L
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{delivery.client || `Client #${delivery.clientId.slice(0, 5)}`}</h3>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">{delivery.deliveryAddress}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded-lg">ID: {delivery.id.slice(0, 4)}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-bold uppercase tracking-widest">
                     {delivery.timeWindow}
                  </div>
                  <div className="text-[#2563EB]"><ChevronRight size={18} /></div>
                </div>
              </Card>
            </motion_div>
          ))
        )}
      </main>
    </div>
  );
}

const motion_div = ({ children, onClick }: any) => <div onClick={onClick} className="cursor-pointer">{children}</div>;
