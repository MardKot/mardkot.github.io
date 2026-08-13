import React, { useState } from 'react';
import { Button } from "./UI";
import { Sparkles, Loader2, ListPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SmartListProps {
  products: any[];
  onAddItems: (items: any[]) => void;
}

export const SmartList: React.FC<SmartListProps> = ({ products, onAddItems }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parseList = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/smart-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          catalogProducts: products,
        }),
      });

      const result = await res.json();
      
      const itemsToAdd = Array.isArray(result) ? result.map((item: any) => {
        const product = products.find(p => p.id === item.productId || String(p.id) === String(item.productId));
        if (!product) return null;

        let finalPrice = product.price;
        let finalQty = 1;

        if (item.customPrc) {
          finalPrice = item.customPrc;
          finalQty = parseFloat((item.customPrc / product.price).toFixed(2));
        } else if (item.customQty) {
          finalQty = item.customQty;
          finalPrice = item.customQty * product.price;
        }

        return {
          ...product,
          name: product.name,
          price: finalPrice,
          quantity: finalQty,
          isSmartAdded: true
        };
      }).filter(Boolean) : [];

      if (itemsToAdd.length > 0) {
        onAddItems(itemsToAdd);
      }
      setInput("");
    } catch (error) {
      console.error("Smart list parsing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-black italic uppercase text-lg tracking-tight">{t('shop.smart_list.title')}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{t('shop.smart_list.subtitle')}</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('shop.smart_list.placeholder')}
          className="w-full min-h-[120px] p-6 rounded-2xl bg-gray-50 border-none text-sm font-medium focus:ring-4 focus:ring-brand/5 outline-none transition-all resize-none"
        />
        <div className="absolute right-4 bottom-4">
          <Button 
            onClick={parseList} 
            disabled={isLoading || !input.trim()}
            variant="primary"
            className="rounded-xl h-12 px-6 gap-2 shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ListPlus size={18} />}
            {isLoading ? t('shop.smart_list.analyzing') : t('shop.smart_list.button')}
          </Button>
        </div>
      </div>
      
      <p className="text-[9px] text-gray-400 font-medium px-2">
        {t('shop.smart_list.tip')}
      </p>
    </div>
  );
};
