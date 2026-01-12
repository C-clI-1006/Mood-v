
import React from 'react';
import { DailyInsight, Language } from '../types';
import { translations } from '../translations';

interface InsightCardProps {
  insight: DailyInsight;
  isLoading: boolean;
  lang: Language;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, isLoading, lang }) => {
  const t = translations[lang];

  if (isLoading) {
    return (
      <div className="px-8 pb-32">
        <div className="p-8 bg-beigegray/30 dark:bg-gray-800/30 rounded-3xl animate-pulse space-y-4">
          <div className="h-2 w-20 bg-beigegray/50 rounded"></div>
          <div className="h-4 w-full bg-beigegray/40 rounded"></div>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="flex flex-col gap-6 px-8 pb-32">
      {/* 关键词与细分情绪 */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
           <span className="px-3 py-1 bg-darkblue text-cream text-[9px] font-black rounded-full uppercase tracking-widest">
             {insight.refinedEmotion}
           </span>
           {insight.keywords.map((k, i) => (
             <span key={i} className="px-3 py-1 bg-beigegray/40 dark:bg-gray-800 text-[9px] font-bold text-darkblue dark:text-beigegray rounded-full">
               #{k}
             </span>
           ))}
        </div>
      </div>

      {/* 接地信息 (地图或搜索来源) */}
      {insight.placesNearby && insight.placesNearby.length > 0 && (
        <div className="bg-beigegray/40 dark:bg-emerald-900/20 p-6 rounded-3xl border border-beigegray/50">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-[10px] font-black text-darkblue uppercase tracking-[0.4em]">{t.seePlaces}</span>
             <div className="h-px flex-1 bg-beigegray/50" />
          </div>
          <div className="flex flex-col gap-2">
            {insight.placesNearby.slice(0, 3).map((place, i) => (
              <a key={i} href={place?.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-2xl text-[11px] font-bold text-darkblue shadow-sm active:scale-95 transition-transform">
                <span className="line-clamp-1">{place?.title}</span>
                <span className="text-darkblue/40 ml-2">🔗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 隐式洞察 */}
      <div className="p-8 bg-deepblue rounded-[2.5rem] text-cream shadow-xl">
        <div className="flex items-center gap-2 mb-4 opacity-70">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t.implicitInsight}</span>
        </div>
        <p className="text-[13px] font-medium leading-relaxed italic">“{insight.implicitAnalysis || '...' }”</p>
      </div>

      {/* 每日寄语 */}
      <div className="text-center px-4 py-2">
        <span className="text-[9px] font-bold text-beigegray uppercase tracking-[0.4em] block mb-4">{t.dailyAffirmation}</span>
        <p className="text-lg font-light text-darkblue dark:text-cream leading-snug">{insight.affirmation || '...' }</p>
      </div>

      {/* 好消息与音乐 */}
      <div className="space-y-4">
        <div className="bg-beigegray/20 p-6 rounded-3xl border border-beigegray/30">
           <span className="text-[9px] font-black text-darkblue/60 uppercase tracking-[0.4em] block mb-4">{t.positiveNews}</span>
           <p className="text-darkblue dark:text-cream text-[12px] leading-relaxed font-medium">{insight.news || '...' }</p>
        </div>

        {insight.musicSuggestion && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-beigegray shadow-sm flex flex-col items-center text-center">
             <span className="text-[9px] font-black text-beigegray uppercase tracking-[0.4em] block mb-6">{t.curatedMusic}</span>
             <h4 className="text-base font-bold text-darkblue dark:text-white mb-0.5">{insight.musicSuggestion?.title}</h4>
             <p className="text-darkblue/60 dark:text-beigegray/60 text-[10px] font-bold mb-6 uppercase tracking-widest">{insight.musicSuggestion?.artist}</p>
             <button 
                onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent((insight.musicSuggestion?.title || '') + ' ' + (insight.musicSuggestion?.artist || ''))}`, '_blank')}
                className="w-full h-12 bg-darkblue text-cream text-[10px] font-bold uppercase tracking-[0.2em] rounded-full active:scale-95 transition-all shadow-md"
             >Play track</button>
          </div>
        )}
      </div>
    </div>
  );
};
