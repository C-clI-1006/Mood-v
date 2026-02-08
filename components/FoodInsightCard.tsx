
import React from 'react';
import { UnifiedInsight, Language } from '../types';
import { translations } from '../translations';

interface FoodInsightCardProps {
  insight: UnifiedInsight;
  isLoading: boolean;
  lang: Language;
}

export const FoodInsightCard: React.FC<FoodInsightCardProps> = ({ insight, isLoading, lang }) => {
  const t = translations[lang];

  if (isLoading) {
    return (
      <div className="px-8 pb-32">
        <div className="p-10 bg-beigegray/30 dark:bg-gray-800/30 rounded-[3rem] animate-pulse space-y-6">
          <div className="h-4 w-1/2 bg-beigegray/50 rounded-full" />
          <div className="h-20 w-full bg-beigegray/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 animate-in fade-in duration-1000">
      {/* 心理洞察 */}
      <div className="p-8 bg-darkblue rounded-[3rem] text-cream shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="flex items-center gap-2 mb-4 opacity-70">
          <span className="text-xl">🧠</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t.implicitInsight}</span>
        </div>
        <p className="text-[14px] font-bold leading-relaxed mb-4">“{insight.analysis}”</p>
        <div className="flex flex-wrap gap-2">
           {insight.keywords?.map((k, i) => (
             <span key={i} className="px-3 py-1 bg-white/10 text-[9px] font-black rounded-full uppercase">#{k}</span>
           ))}
        </div>
      </div>

      {/* 地图引导卡片 */}
      {insight.places && insight.places.length > 0 && (
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[3rem] border border-beigegray/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <span className="text-[10px] font-black text-darkblue dark:text-cream uppercase tracking-[0.4em]">{t.seePlaces}</span>
             <span className="text-xs">📍</span>
          </div>
          <div className="flex flex-col gap-3">
            {insight.places?.map((place, i) => (
              <a 
                key={i} 
                href={place.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center justify-between p-5 bg-beigegray/20 dark:bg-gray-800 rounded-3xl active:scale-95 transition-all hover:bg-darkblue hover:text-white"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black line-clamp-1">{place.title}</span>
                  <span className="text-[8px] opacity-40 group-hover:opacity-60">点击在地图中打开</span>
                </div>
                <span className="text-lg opacity-40 group-hover:opacity-100">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 烹饪小贴士 */}
      {insight.recipe && (
        <div className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[3rem] border border-orange-100 dark:border-orange-900/30">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-lg">👩‍🍳</span>
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">在家试试</span>
          </div>
          <h4 className="text-base font-bold text-darkblue dark:text-cream mb-2">{insight.recipe.title}</h4>
          <div className="flex gap-2 mb-4">
            <span className="px-2 py-0.5 bg-orange-200 dark:bg-orange-900 text-[8px] font-black rounded uppercase text-orange-700 dark:text-orange-200">
               {insight.recipe.difficulty}
            </span>
          </div>
          <p className="text-[11px] text-orange-800/70 dark:text-orange-200/60 leading-relaxed font-medium">
            关键食材: {insight.recipe.keyIngredients?.join(', ')}
          </p>
        </div>
      )}

      <div className="text-center py-4">
        <p className="text-sm font-medium text-beigegray italic">“{insight.petComment}”</p>
      </div>
    </div>
  );
};
