
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
  
  // 动态调整呼吸频率：焦虑时快，默认/平静时平稳
  const breathDuration = currentMood === 'anxious' ? '1.5s' : currentMood === 'energetic' ? '2.5s' : '4s';

  return (
    <div 
      className="relative flex items-center justify-center transition-all duration-1000 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      {/* 背景发光 Aura */}
      <div className={`absolute w-64 h-64 rounded-full blur-3xl animate-glow transition-colors duration-1000 ${isNegative ? 'bg-rose-400/20' : isPositive ? 'bg-yellow-400/20' : 'bg-indigo-300/15'}`} />
      
      {/* 负面情绪：爱心汇聚 */}
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

      {/* 正面情绪：能量冒泡 */}
      {isPositive && !isUpdating && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(10)].map((_, i) => (
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
        </div>
      )}

      {/* 进化/更新加载圈 */}
      {isUpdating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-52 h-52 border-[6px] border-deepblue/10 border-t-darkblue rounded-full animate-spin" />
        </div>
      )}

      {/* 守护者主体 */}
      <div 
        className={`relative transition-all duration-700 ${isUpdating ? 'opacity-40 blur-sm scale-95' : 'opacity-100'} animate-breath`}
        style={{ animationDuration: breathDuration }}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={type} 
            className="w-56 h-56 rounded-[3.5rem] object-cover ring-8 ring-white dark:ring-gray-800 shadow-2xl"
          />
        ) : (
          <div className="w-56 h-56 bg-beigegray/20 dark:bg-gray-800 rounded-[3.5rem] flex items-center justify-center border-4 border-dashed border-beigegray">
             <div className="flex flex-col items-center opacity-30">
                <div className="w-6 h-6 border-2 border-darkblue border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-[10px] font-black tracking-widest uppercase text-darkblue">Awakening...</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
