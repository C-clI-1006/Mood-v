
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
  { type: 'energetic', color: 'bg-darkblue' },
  { type: 'calm', color: 'bg-darkblue' },
  { type: 'neutral', color: 'bg-darkblue' },
  { type: 'anxious', color: 'bg-darkblue' },
  { type: 'sad', color: 'bg-darkblue' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood, lang }) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {moods.map((m) => (
        <button
          key={m.type}
          onClick={() => onSelect(m.type)}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 ${
            selectedMood === m.type 
              ? `${m.color} scale-105 shadow-lg text-cream ring-4 ring-cream dark:ring-gray-800` 
              : 'bg-beigegray/30 dark:bg-gray-800 shadow-sm text-deepblue/60 dark:text-gray-400 hover:bg-beigegray/50'
          }`}
        >
          {MoodIcons[m.type]('w-10 h-10 mb-2')}
          <span className="text-xs font-semibold">{t[m.type]}</span>
        </button>
      ))}
    </div>
  );
};
