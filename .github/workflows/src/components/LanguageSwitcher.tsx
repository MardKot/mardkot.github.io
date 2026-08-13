import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { Languages } from 'lucide-react';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'fon', name: 'Fɔ̀ngbè', flag: '🇧🇯' }
];

export const LanguageSwitcher: React.FC<{ className?: string; isFloating?: boolean }> = ({ className, isFloating }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className={cn(
      "relative", 
      isFloating ? "fixed bottom-6 right-24 sm:right-28 z-[100]" : "",
      className
    )}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-lg border border-gray-100 ring-4 ring-white/50 transition-all",
          isFloating ? "h-14 px-4 sm:px-6 scale-110 md:scale-100 hover:scale-105 active:scale-95" : "bg-gray-50 hover:bg-gray-100"
        )}
      >
        <Languages size={isFloating ? 20 : 16} className="text-brand" />
        <span className={cn("font-black tracking-widest uppercase", isFloating ? "text-[10px] sm:text-sm" : "text-xs")}>
          {isFloating ? (window.innerWidth < 640 ? currentLanguage.code : currentLanguage.name) : currentLanguage.code}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "absolute mt-2 w-48 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200",
            isFloating ? "bottom-20 right-0 origin-bottom-right mb-2" : "right-0 top-full"
          )}>
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Langue / Èdè / Gbe</span>
              <Languages size={14} className="text-gray-300" />
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-all group",
                  i18n.language === lang.code ? "bg-brand/5 text-brand" : "text-gray-600"
                )}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{lang.flag}</span>
                <span className="text-sm font-black tracking-tight">{lang.name}</span>
                {i18n.language === lang.code && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
