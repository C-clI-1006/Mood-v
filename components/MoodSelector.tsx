
import React from 'react';
import { MoodType } from '../types';
import { MoodIcons } from './Icons';

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood: MoodType | null;
}

const moods: { type: MoodType; label: string; color: string }[] = [
  { type: 'happy', label: '开心', color: 'bg-yellow-400' },
  { type: 'energetic', label: '充满活力', color: 'bg-orange-400' },
  { type: 'calm', label: '平静', color: 'bg-blue-300' },
  { type: 'neutral', label: '一般', color: 'bg-gray-300' },
  { type: 'anxious', label: '焦虑', color: 'bg-purple-300' },
  { type: 'sad', label: '难过', color: 'bg-indigo-300' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {moods.map((m) => (
        <button
          key={m.type}
          onClick={() => onSelect(m.type)}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 ${
            selectedMood === m.type 
              ? `${m.color} scale-105 shadow-lg text-white ring-4 ring-white/50` 
              : 'bg-white shadow-sm text-gray-500 hover:bg-gray-50'
          }`}
        >
          {MoodIcons[m.type]('w-10 h-10 mb-2')}
          <span className="text-xs font-semibold">{m.label}</span>
        </button>
      ))}
    </div>
  );
};
