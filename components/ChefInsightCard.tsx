
import React from 'react';
/* Fixed: FoodInsight does not exist in types.ts, replaced with UnifiedInsight */
import { UnifiedInsight, Language } from '../types';
import { translations } from '../translations';

interface ChefInsightCardProps {
  insight: UnifiedInsight;
  isLoading: boolean;
  lang: Language;
}

export const ChefInsightCard: React.FC<ChefInsightCardProps> = ({ insight, isLoading, lang }) => {
  const t = translations[lang];

  if (isLoading) return (
    <div className="px-8 pb-32">
      <div className="h-64 bg-beigegray/30 rounded-[3rem] animate-pulse" />
    </div>
  );

  if (!insight) return null;

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 animate-in fade-in duration-700">
      <div className="p-8 bg-darkblue rounded-[3rem] text-cream relative overflow-hidden">
        <div className="absolute top-4 right-8 text-4xl opacity-10">👨‍🍳</div>
        <div className="flex items-center gap-2 mb-4">
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cream/50">{t.implicitInsight}</span>
        </div>
        {/* Fixed: Changed insight.chefAnalysis to insight.analysis to match UnifiedInsight interface */}
        <p className="text-[14px] font-bold leading-relaxed italic mb-6">“{insight.analysis}”</p>
        
        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📔</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{t.dailyAffirmation}</span>
          </div>
          {/* Fixed: Changed insight.cookingTip to insight.tip to match UnifiedInsight interface */}
          <p className="text-[11px] font-medium leading-relaxed text-cream/80">{insight.tip}</p>
        </div>
      </div>

      {/* Fixed: Changed insight.placesNearby to insight.places to match UnifiedInsight interface */}
      {insight.places && (
        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[3rem] border border-beigegray/50">
           <span className="text-[10px] font-black text-darkblue uppercase tracking-[0.4em] block mb-6">{t.seePlaces}</span>
           <div className="grid grid-cols-1 gap-3">
             {insight.places.map((place, i) => (
               <a key={i} href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-beigegray/10 rounded-3xl hover:bg-darkblue hover:text-white transition-all group">
                  <span className="text-xs font-black">{place.title}</span>
                  <span className="opacity-30 group-hover:opacity-100">↗</span>
               </a>
             ))}
           </div>
        </div>
      )}

      <p className="text-center text-[10px] font-bold text-beigegray italic">“{insight.petComment}”</p>
    </div>
  );
};
