
import React from 'react';
import { PetType, MoodType } from '../types';

interface PetAvatarProps {
  type: PetType;
  level: number;
  imageUrl?: string;
  isUpdating?: boolean;
  currentMood?: MoodType | null;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({ type, level, imageUrl, isUpdating, currentMood }) => {
  const scale = Math.min(1 + (level - 1) * 0.1, 1.4);
  const isPositive = currentMood === 'happy' || currentMood === 'energetic';
  const isNegative = currentMood === 'sad' || currentMood === 'anxious';
  const isNeutral = currentMood === 'calm' || currentMood === 'neutral' || !currentMood;

  return (
    <div 
      className="relative flex items-center justify-center transition-all duration-1000 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      {/* 背景发光 Aura */}
      <div className={`absolute w-64 h-64 rounded-full blur-3xl animate-glow ${isNegative ? 'bg-rose-400/20' : isPositive ? 'bg-yellow-400/20' : 'bg-indigo-300/15'}`} />
      
      {/* 安抚粒子效果：针对负面情绪产生的爱心 (温暖拥抱汇聚感) */}
      {isNegative && !isUpdating && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-rose-400 text-xl animate-heart"
              style={{ 
                left: `${15 + Math.random() * 70}%`, 
                top: '60%',
                animationDelay: `${i * 0.3}s`,
                fontSize: `${14 + Math.random() * 10}px`
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      {/* 快乐粒子效果：冒泡泡 (冉冉升起) */}
      {isPositive && !isUpdating && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-blue-300 dark:text-blue-100 opacity-60 animate-bubble-rise"
              style={{ 
                left: `${10 + Math.random() * 80}%`, 
                top: '70%',
                animationDelay: `${i * 0.4}s`,
                fontSize: `${12 + Math.random() * 16}px`
              }}
            >
              🫧
            </div>
          ))}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i+20}
              className="absolute text-yellow-400 animate-bubble-rise"
              style={{ 
                left: `${20 + Math.random() * 60}%`, 
                top: '50%',
                animationDelay: `${i * 0.7}s`,
                fontSize: '14px'
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* 进化/加载的光圈 */}
      {isUpdating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-52 h-52 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
        </div>
      )}

      {/* 守护者主体 (呼吸蓄力感) */}
      <div className={`relative transition-all duration-700 ${isUpdating ? 'opacity-40 blur-sm scale-95' : 'opacity-100'} ${isNeutral ? 'animate-breath' : 'animate-breath'}`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={type} 
            className="w-56 h-56 rounded-[3.5rem] object-cover ring-8 ring-white dark:ring-gray-800 shadow-2xl"
          />
        ) : (
          <div className="w-56 h-56 bg-gray-50 dark:bg-gray-800 rounded-[3.5rem] flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700">
             <div className="flex flex-col items-center opacity-30">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-[10px] font-black tracking-widest uppercase dark:text-white">Soul Awakening</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
