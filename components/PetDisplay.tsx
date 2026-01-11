
import React from 'react';
import { PetState, MoodType, PetAccessory, Language } from '../types';
import { PetAvatar } from './PetAvatar';
import { translations } from '../translations';

interface PetDisplayProps {
  pet: PetState;
  currentMood: MoodType | null;
  onUpdateAccessory: (acc: PetAccessory) => void;
  isUpdating?: boolean;
  petMessage?: string;
  lang: Language;
}

const PET_NAMES: Record<string, string> = {
  dog: 'DOGGY',
  cat: 'KITTY',
  mouse: 'MOUSE',
  kangaroo: 'ROO',
  koala: 'KOALA',
  custom: 'CUSTOM'
};

const ACCESSORIES: { id: PetAccessory; icon: string }[] = [
  { id: 'none', icon: '✨' },
  { id: 'hat', icon: '🎩' },
  { id: 'scarf', icon: '🧣' },
  { id: 'bowtie', icon: '🎀' },
];

export const PetDisplay: React.FC<PetDisplayProps> = ({ pet, currentMood, onUpdateAccessory, isUpdating, petMessage, lang }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center p-8">
      {/* Header */}
      <div className="flex justify-between w-full mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.3em] text-beigegray uppercase">Soul Guardian</span>
          <span className="text-3xl font-black text-deepblue dark:text-white tracking-tighter">{PET_NAMES[pet.type] || 'MY PET'}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black tracking-[0.3em] text-beigegray uppercase">{t.level}</span>
          <div className="text-3xl font-black text-deepblue dark:text-gray-200 tabular-nums">{pet.level}</div>
        </div>
      </div>

      {/* 对话气泡 (安抚气泡) */}
      <div className="h-28 w-full mb-2 flex items-end justify-center px-2">
        {isUpdating ? (
          <div className="relative bg-cream dark:bg-gray-800 px-6 py-4 rounded-[2.2rem] shadow-2xl border border-beigegray dark:border-indigo-900/30 animate-bubble-pop">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-darkblue rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-1.5 h-1.5 bg-darkblue rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-1.5 h-1.5 bg-darkblue rounded-full animate-bounce" />
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-cream dark:bg-gray-800 border-r border-b border-beigegray dark:border-indigo-900/30 rotate-45" />
          </div>
        ) : petMessage ? (
          <div className="relative bg-cream dark:bg-gray-800 px-6 py-4 rounded-[2.2rem] shadow-2xl border border-beigegray dark:border-gray-700 animate-bubble-pop max-w-[90%]">
            <p className="text-sm font-bold text-deepblue dark:text-gray-100 text-center leading-relaxed">
              {petMessage}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-cream dark:bg-gray-800 border-r border-b border-beigegray dark:border-gray-700 rotate-45" />
          </div>
        ) : (
          <div className="w-2 h-2 bg-beigegray dark:bg-gray-800 rounded-full animate-pulse opacity-40" />
        )}
      </div>

      {/* Pet Hero Card */}
      <div className="relative py-12 mb-10 w-full flex justify-center bg-beigegray/20 dark:bg-gray-800/50 rounded-[4.5rem] shadow-2xl shadow-beigegray/40 dark:shadow-black/40 border border-beigegray/30 dark:border-gray-700 transition-all duration-700">
        <PetAvatar 
          type={pet.type} 
          level={pet.level} 
          imageUrl={pet.imageUrl}
          isUpdating={isUpdating}
          currentMood={currentMood}
        />
        
        {/* Vitality Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-44 flex flex-col gap-2">
          <div className="flex justify-between text-[9px] font-black text-beigegray px-1 uppercase tracking-widest">
             <span className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 bg-darkblue rounded-full animate-pulse" />
               {t.vitality}
             </span>
             <span>{pet.hp}%</span>
          </div>
          <div className="h-2.5 w-full bg-cream dark:bg-gray-700 rounded-full overflow-hidden p-0.5 border border-beigegray/30 dark:border-gray-600 shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out bg-darkblue dark:bg-white"
              style={{ width: `${pet.hp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-4 gap-4 w-full">
        {ACCESSORIES.map(acc => (
          <button
            key={acc.id}
            disabled={isUpdating}
            onClick={() => onUpdateAccessory(acc.id)}
            className={`group relative py-4 rounded-[2rem] flex flex-col items-center transition-all duration-500 border-2 ${
              pet.accessory === acc.id 
                ? 'bg-darkblue border-darkblue text-cream shadow-xl -translate-y-2' 
                : 'bg-beigegray/30 border-transparent text-deepblue/40 hover:border-beigegray active:scale-95'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">{acc.icon}</span>
            <span className="text-[9px] font-black tracking-widest opacity-80 uppercase">{acc.id}</span>
          </button>
        ))}
      </div>

      {/* Status Indicators */}
      <div className="mt-8 h-6 flex items-center justify-center">
        {isUpdating ? (
          <span className="text-[10px] font-black text-darkblue dark:text-indigo-400 animate-pulse uppercase tracking-[0.4em]">
            {t.magicInProgress}
          </span>
        ) : (
          <span className="text-[10px] font-black text-beigegray dark:text-gray-600 uppercase tracking-[0.4em]">
            {t.soulLink}
          </span>
        )}
      </div>
    </div>
  );
};
