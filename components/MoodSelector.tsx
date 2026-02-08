
import React from 'react';
import { MoodType, Language } from '../types';
import { MoodIcons } from './Icons';
import { translations } from '../translations';

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood: MoodType | null;
  lang: Language;
}

const moods: { type: MoodType; color: string }[] = [
  { type: 'happy', color: 'bg-darkblue' },
  { type: 'energetic', color: 'bg-indigo-600' },
  { type: 'calm', color: 'bg-emerald-700' },
  { type: 'neutral', color: 'bg-slate-700' },
  { type: 'anxious', color: 'bg-amber-700' },
  { type: 'sad', color: 'bg-rose-900' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood, lang }) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-3 gap-3 p-3">
      {moods.map((m) => (
        <button
          key={m.type}
          onClick={() => onSelect(m.type)}
          className={`relative flex flex-col items-center justify-center p-5 rounded-[2rem] transition-all duration-500 overflow-hidden ${
            selectedMood === m.type 
              ? `${m.color} text-white shadow-2xl scale-[1.02] -translate-y-1` 
              : 'bg-white dark:bg-white/5 text-deepblue/40 dark:text-white/20 hover:text-deepblue dark:hover:text-white'
          }`}
        >
          {selectedMood === m.type && (
            <div className="absolute inset-0 bg-white/10 blur-xl animate-pulse" />
          )}
          <div className="relative z-10 transition-transform duration-500 transform group-active:scale-90">
            {MoodIcons[m.type]('w-8 h-8 mb-2.5')}
          </div>
          <span className="relative z-10 text-[9px] font-black uppercase tracking-widest opacity-80">{t[m.type]}</span>
        </button>
      ))}
    </div>
  );
};
