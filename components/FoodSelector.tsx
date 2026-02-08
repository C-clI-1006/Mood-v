
import React from 'react';
import { CraveType, Language } from '../types';
import { translations } from '../translations';

interface FoodSelectorProps {
  onSelect: (crave: CraveType) => void;
  selectedCrave: CraveType | null;
  lang: Language;
}

const craves: { type: CraveType; icon: string; color: string }[] = [
  { type: 'comfort', icon: '🍜', color: 'bg-orange-500' },
  { type: 'healthy', icon: '🥗', color: 'bg-emerald-500' },
  { type: 'spicy', icon: '🌶️', color: 'bg-rose-500' },
  { type: 'sweet', icon: '🍰', color: 'bg-pink-400' },
  { type: 'social', icon: '🍻', color: 'bg-amber-500' },
  { type: 'surprise', icon: '🎲', color: 'bg-indigo-500' },
];

export const FoodSelector: React.FC<FoodSelectorProps> = ({ onSelect, selectedCrave, lang }) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-3 gap-3 p-1">
      {craves.map((c) => (
        <button
          key={c.type}
          onClick={() => onSelect(c.type)}
          className={`flex items-center gap-2 px-3 py-3 rounded-[1.2rem] transition-all duration-300 border ${
            selectedCrave === c.type 
              ? `bg-darkblue border-darkblue scale-[1.02] shadow-xl text-white` 
              : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-500 hover:bg-slate-50 active:scale-95'
          }`}
        >
          <span className="text-lg leading-none">{c.icon}</span>
          <span className="text-[8px] font-black uppercase tracking-wider truncate">{t[c.type]}</span>
        </button>
      ))}
    </div>
  );
};
