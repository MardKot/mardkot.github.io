import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./UI";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  ShoppingBasket,
  Smile,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAction?: boolean;
}

interface AIChatbotProps {
  products: any[];
  onAddItems: (items: any[]) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ products, onAddItems }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: t('shop.chatbot.welcome'),
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500); // Proactively open after 2.5s
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: currentInput,
          messages: messages,
          catalogProducts: products,
        }),
      });

      const result = await res.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.reply || "Bonjour ! Que souhaitez-vous acheter aujourd'hui ?",
        timestamp: new Date()
      };

      if (result.actions && result.actions.length > 0) {
        const itemsToAdd = result.actions.map((act: any) => {
          const product = products.find(p => p.id == act.productId); // Use == for mixed type matching
          if (!product) return null;

          let finalPrice = product.price;
          let finalQty = 1;

          if (act.prc) {
            finalPrice = act.prc;
            finalQty = parseFloat((act.prc / product.price).toFixed(2));
          } else if (act.qty) {
            finalQty = act.qty;
            finalPrice = act.qty * product.price;
          }

          return {
            ...product,
            price: finalPrice,
            quantity: finalQty,
            isSmartAdded: true
          };
        }).filter(Boolean);

        if (itemsToAdd.length > 0) {
          onAddItems(itemsToAdd);
          botMessage.isAction = true;
          botMessage.text += `\n\n${t('shop.chatbot.added_success', { count: itemsToAdd.length })}`;
        }
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: t('shop.chatbot.error'),
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden glass"
          >
            {/* Header */}
            <div className="p-6 bg-brand text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">{t('shop.chatbot.title')}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">{t('shop.chatbot.status')}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-brand text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-800 rounded-tl-none whitespace-pre-wrap"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-gray-300 mt-1 uppercase">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-50 flex items-center gap-3">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('shop.chatbot.placeholder')}
                className="flex-1 h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-brand/5 outline-none transition-all"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                variant="primary"
                className="w-12 h-12 rounded-xl p-0 flex items-center justify-center shrink-0"
              >
                {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative",
          isOpen ? "bg-white text-brand" : "bg-brand text-white"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={28} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-brand">1</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
