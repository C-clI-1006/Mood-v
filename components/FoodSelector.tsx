
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
    <div className="grid grid-cols-3 gap-4 p-4">
      {craves.map((c) => (
        <button
          key={c.type}
          onClick={() => onSelect(c.type)}
          className={`flex flex-col items-center justify-center p-5 rounded-[2.5rem] transition-all duration-300 ${
            selectedCrave === c.type 
              ? `bg-darkblue scale-105 shadow-2xl text-cream ring-4 ring-white dark:ring-gray-800` 
              : 'bg-white dark:bg-gray-800 shadow-sm text-deepblue/60 dark:text-gray-400 hover:shadow-md'
          }`}
        >
          <span className="text-3xl mb-2">{c.icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{t[c.type]}</span>
        </button>
      ))}
    </div>
  );
};
