
import React from 'react';
import { PetState, MoodType, Language } from '../types';
import { PetAvatar } from './PetAvatar';
import { translations } from '../translations';

interface PetDisplayProps {
  pet: PetState;
  currentMood: MoodType | null;
  isUpdating?: boolean;
  petMessage?: string;
  lang: Language;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({ pet, currentMood, isUpdating, petMessage, lang }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center p-8">
      {/* 顶部元数据 */}
      <div className="flex justify-between w-full mb-6">
        <div className="flex flex-col">
          <span className="text-[9px] font-black tracking-[0.4em] text-slate-300 dark:text-slate-700 uppercase mb-1">{t.petProfile}</span>
          <span className="text-2xl font-black text-darkblue dark:text-white tracking-tighter uppercase">{pet.name || pet.type}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black tracking-[0.4em] text-slate-300 dark:text-slate-700 uppercase mb-1">{t.level}</span>
          <div className="text-2xl font-black text-darkblue dark:text-indigo-400 tabular-nums">0{pet.level}</div>
        </div>
      </div>

      {/* 对话气泡 (Message Core) */}
      <div className="h-24 w-full mb-6 flex items-end justify-center px-4">
        {isUpdating ? (
          <div className="flex items-center gap-1.5 opacity-20 animate-pulse">
            <div className="w-1 h-1 bg-darkblue dark:bg-white rounded-full" />
            <div className="w-1 h-1 bg-darkblue dark:bg-white rounded-full" />
            <div className="w-1 h-1 bg-darkblue dark:bg-white rounded-full" />
          </div>
        ) : petMessage ? (
          <div className="relative bg-white dark:bg-midnight-card px-8 py-5 rounded-[2.2rem] shadow-2xl border border-slate-100 dark:border-white/5 animate-bubble-pop max-w-[95%]">
            <p className="text-[13px] font-bold text-darkblue dark:text-cream text-center leading-relaxed tracking-tight italic">"{petMessage}"</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-midnight-card border-r border-b border-slate-100 dark:border-white/5 rotate-45" />
          </div>
        ) : null}
      </div>

      {/* 映射区域 (Mapping Zone) */}
      <div className="relative py-14 mb-10 w-full flex justify-center bg-slate-50/50 dark:bg-white/5 rounded-[4.5rem] shadow-inner transition-all duration-1000">
        <PetAvatar type={pet.type} level={pet.level} imageUrl={pet.imageUrl} isUpdating={isUpdating} currentMood={currentMood} />
        
        {/* 状态追踪器 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 flex flex-col gap-2">
          <div className="flex justify-between text-[8px] font-black text-slate-300 dark:text-slate-600 px-1 uppercase tracking-widest">
             <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />{t.vitality}</span>
             <span className="text-indigo-500/60">{pet.hp}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-[1px]">
            <div className="h-full rounded-full transition-all duration-1000 ease-out bg-darkblue dark:bg-indigo-500" style={{ width: `${pet.hp}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-10 h-6 flex items-center justify-center">
        <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em] animate-pulse">
          {isUpdating ? t.magicInProgress : t.soulLink}
        </span>
      </div>
    </div>
  );
};
