
import React, { useState, useEffect } from 'react';
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
  
  const breathDuration = currentMood === 'anxious' ? '1.5s' : currentMood === 'energetic' ? '2.5s' : '5s';

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 稍微削弱位移，增加“沉重”的质感
      const x = (e.clientX / window.innerWidth - 0.5) * 80;
      const y = (e.clientY / window.innerHeight - 0.5) * 80;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="relative flex items-center justify-center transition-transform duration-1000 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      {/* 极简高级光晕 (Advanced Aura) */}
      <div 
        className="absolute w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ease-out animate-aura-rotate"
        style={{ 
          background: isNegative 
            ? 'conic-gradient(from 0deg, #f43f5e, #fb7185, #f43f5e)' 
            : isPositive 
            ? 'conic-gradient(from 0deg, #f59e0b, #fbbf24, #f59e0b)'
            : 'conic-gradient(from 0deg, #6366f1, #818cf8, #6366f1)',
          opacity: 0.15,
          transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`
        }}
      />
      
      {/* 极简能量场 */}
      <div 
        className={`absolute w-64 h-64 border border-white/5 rounded-full animate-glow transition-all duration-1000 ${isPositive ? 'scale-110' : 'scale-100'}`}
        style={{ transform: `translate3d(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px, 0)` }}
      />

      {/* 负面情绪：细小晶体汇聚 (替代爱心) */}
      {isNegative && !isUpdating && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-rose-400 rounded-sm animate-bubble-rise"
              style={{ 
                left: `${30 + Math.random() * 40}%`, 
                top: '50%',
                animationDelay: `${i * 0.6}s`,
                opacity: 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* 正面情绪：上升线条 (替代气泡) */}
      {isPositive && !isUpdating && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-[1px] h-8 bg-amber-400/40 animate-bubble-rise"
              style={{ 
                left: `${20 + Math.random() * 60}%`, 
                top: '60%',
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      <div 
        className={`relative transition-transform duration-300 ease-out ${isUpdating ? 'opacity-20 blur-md scale-90' : 'opacity-100'}`}
        style={{ transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)` }}
      >
        <div className="animate-breath" style={{ animationDuration: breathDuration }}>
          {imageUrl ? (
            <div className="relative p-2 bg-white/5 dark:bg-white/5 rounded-[4rem] backdrop-blur-3xl shadow-2xl border border-white/10">
              <img 
                src={imageUrl} 
                alt={type} 
                className="w-52 h-52 rounded-[3.5rem] object-cover ring-1 ring-white/10 transition-all duration-1000"
              />
            </div>
          ) : (
            <div className="w-52 h-52 bg-slate-900/5 dark:bg-white/5 rounded-[3.5rem] flex items-center justify-center border border-white/5">
               <div className="flex flex-col items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-[8px] font-black tracking-[0.4em] uppercase text-indigo-500/40">Syncing</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
