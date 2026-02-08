
import React from 'react';
import { UnifiedInsight, Language } from '../types';
import { translations } from '../translations';
import { AppIcons } from './Icons';

interface InsightCardProps {
  insight: UnifiedInsight;
  isLoading: boolean;
  lang: Language;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, isLoading, lang }) => {
  const t = translations[lang];

  if (isLoading) {
    return (
      <div className="px-8 pb-32">
        <div className="p-8 bg-slate-100/50 dark:bg-white/5 rounded-[3rem] animate-pulse space-y-5">
          <div className="h-2 w-1/4 bg-slate-200 dark:bg-white/10 rounded-full" />
          <div className="h-16 w-full bg-slate-200 dark:bg-white/10 rounded-2xl" />
          <div className="h-8 w-2/3 bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!insight) return null;

  const isDaily = insight.type === 'daily';

  return (
    <div className="flex flex-col gap-5 px-6 pb-40 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* 积极好消息推送 */}
      {insight.news && isDaily && (
        <div className="animate-push relative p-6 bg-white dark:bg-midnight-card rounded-[2.5rem] border-l-4 border-l-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                {AppIcons.news('w-4 h-4')}
              </div>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t.positiveNews}</span>
              <span className="ml-auto text-[8px] font-bold text-slate-300 uppercase">Now</span>
           </div>
           <p className="text-[14px] font-bold leading-relaxed text-slate-800 dark:text-slate-200 px-1">
             {insight.news}
           </p>
        </div>
      )}

      {/* 核心情绪分析 */}
      <div className="p-8 bg-darkblue dark:bg-indigo-950 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-5">
           <div className="w-5 h-5 text-indigo-400">
             {isDaily ? AppIcons.sparkles() : AppIcons.archive()}
           </div>
           <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50">
             {isDaily ? t.refinedEmotion : t.implicitInsight}
           </span>
           {insight.refinedEmotion && <div className="w-1 h-1 bg-white/20 rounded-full mx-1" />}
           {insight.refinedEmotion && <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">{insight.refinedEmotion}</span>}
        </div>
        <p className="text-[16px] font-bold leading-relaxed tracking-tight italic mb-8">“{insight.analysis}”</p>
        
        <div className="flex flex-wrap gap-2">
           {insight.keywords?.map((k, i) => (
             <span key={i} className="px-3 py-1 bg-white/5 text-[8px] font-black rounded-full uppercase tracking-widest border border-white/5">#{k}</span>
           ))}
        </div>
      </div>

      {/* 听觉配方 (Music Recommendation) */}
      {insight.music && (
        <div className="bg-white dark:bg-midnight-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 flex items-center gap-6 group">
          <div className="w-16 h-16 bg-slate-900 dark:bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 animate-aura-rotate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5 block">{t.curatedMusic}</span>
             <h4 className="text-[15px] font-black text-slate-900 dark:text-white truncate uppercase">{insight.music.title}</h4>
             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{insight.music.artist}</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      {/* 地图引导 */}
      {insight.places && insight.places.length > 0 && (
        <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[3.5rem] border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-6 px-1">
             <div className="w-4 h-4 text-indigo-500">
               {AppIcons.map()}
             </div>
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">{t.seePlaces}</span>
          </div>
          <div className="flex flex-col gap-3">
            {insight.places?.slice(0, 3).map((place, i) => (
              <a 
                key={i} 
                href={place.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-6 bg-white dark:bg-midnight-card rounded-[2.2rem] group active:scale-[0.97] transition-all border border-transparent hover:border-indigo-500/30 shadow-sm"
              >
                <div className="flex flex-col flex-1 overflow-hidden pr-4">
                  <span className="text-[13px] font-black text-slate-900 dark:text-cream truncate mb-1">{place.title}</span>
                  <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
                    {place.matchReason || 'Highly Recommended for you'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                   {AppIcons.plus('w-5 h-5 rotate-45')}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 寄语与建议 */}
      <div className="text-center px-8 py-6 opacity-60">
        <p className="text-[12px] font-medium text-slate-500 italic leading-relaxed">
          {insight.affirmation || insight.petComment}
        </p>
      </div>
    </div>
  );
};
