
import React, { useState, useEffect, useMemo } from 'react';
import { FoodEntry, ReportData, CuisineType, Language } from '../types';
import { generateReport } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { translations } from '../translations';

const COLORS: Record<string, string> = {
  Chinese: '#E63946', Japanese: '#457B9D', Italian: '#2A9D8F', French: '#E9C46A', Western: '#F4A261', StreetFood: '#E76F51', Cafe: '#DDA15E', Other: '#606C38'
};

const CUISINE_ICONS: Record<CuisineType, string> = {
  Chinese: '🥟', Japanese: '🍣', Italian: '🍝', French: '🥐', Western: '🥩', StreetFood: '🍢', Cafe: '☕', Other: '🗺️'
};

export const ReportView: React.FC<{ history: FoodEntry[]; lang: Language }> = ({ history, lang }) => {
  const t = translations[lang];
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (history.length >= 1) {
      setIsLoading(true);
      generateReport(history, 'weekly', lang).then(setReport).finally(() => setIsLoading(false));
    }
  }, [history, lang]);

  const chartData = useMemo(() => {
    const counts: any = {};
    history.forEach(h => counts[h.cuisine] = (counts[h.cuisine] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value: value as number }));
  }, [history]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in">
      <div className="text-6xl mb-6 opacity-20">📔</div>
      <p className="text-beigegray font-black uppercase tracking-widest text-[10px]">{lang === 'zh' ? '暂无品鉴档案' : 'No Tasting Logs Yet'}</p>
    </div>
  );

  return (
    <div className="px-8 pt-12 pb-32 space-y-8 animate-in fade-in">
      <header>
        <h2 className="text-3xl font-black text-darkblue dark:text-cream tracking-tighter">{t.stats}</h2>
        <p className="text-[10px] font-bold text-beigegray uppercase tracking-[0.4em] mt-1">Dining Analytics & History</p>
      </header>

      {/* Pie Chart Section */}
      <div className="bg-white dark:bg-gray-800/40 p-8 rounded-[3rem] border border-beigegray/30 shadow-sm">
        <span className="text-[10px] font-black text-darkblue dark:text-cream uppercase tracking-[0.4em] block mb-6">{lang === 'zh' ? '味觉版图' : 'Taste Map'}</span>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" animationDuration={1000}>
                {chartData.map((entry, index) => <Cell key={index} fill={COLORS[entry.name] || '#ccc'} stroke="none" />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-y-3 mt-6">
          {chartData.map(d => (
            <div key={d.name} className="flex items-center gap-2 text-[10px] font-bold">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[d.name] }} />
              <span className="text-darkblue/70 dark:text-cream/70 uppercase tracking-wider">{t[d.name as CuisineType]}</span>
              <span className="ml-auto text-darkblue dark:text-cream font-black mr-4">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Report Summary */}
      {isLoading ? (
        <div className="bg-beigegray/10 rounded-[3rem] h-32 animate-pulse flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-beigegray">分析中...</span>
        </div>
      ) : report && (
        <div className="space-y-6">
          <div className="bg-darkblue p-8 rounded-[3rem] text-cream shadow-xl">
            <span className="text-[9px] font-black text-cream/40 uppercase tracking-[0.4em] block mb-4">{lang === 'zh' ? '主导风味' : 'Dominant Tone'}</span>
            <div className="flex items-center gap-4">
               <div className="text-4xl">{CUISINE_ICONS[report.dominantCuisine]}</div>
               <div>
                 <h4 className="text-2xl font-black tracking-tighter uppercase">{t[report.dominantCuisine]}</h4>
                 <p className="text-[11px] text-cream/70 leading-relaxed mt-1">{report.summary}</p>
               </div>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-4">
               <span className="text-xl">👨‍🍳</span>
               <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.chefAdvice}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed italic text-amber-900/80 dark:text-amber-200/80">"{report.chefAdvice}"</p>
          </div>
        </div>
      )}

      {/* Detailed Tasting Logs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black text-darkblue dark:text-cream uppercase tracking-[0.4em]">{lang === 'zh' ? '近期品鉴详情' : 'Recent Tastings'}</span>
          <span className="text-[9px] font-bold text-beigegray uppercase tracking-widest">{history.length} ITEMS</span>
        </div>
        <div className="grid gap-4">
          {sortedHistory.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-800/40 p-6 rounded-[2.5rem] border border-beigegray/20 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-darkblue dark:text-white leading-tight">
                    {entry.review?.restaurantName || (lang === 'zh' ? '未知餐厅' : 'Unknown Spot')}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">{CUISINE_ICONS[entry.cuisine]}</span>
                    <span className="text-[9px] font-black text-beigegray uppercase tracking-widest">{t[entry.cuisine]}</span>
                    <span className="text-[8px] text-beigegray/60">•</span>
                    <span className="text-[9px] font-bold text-beigegray">{new Date(entry.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-darkblue/5 dark:bg-cream/5 px-2 py-1 rounded-full">
                  <span className="text-[10px] font-black text-darkblue dark:text-cream">{entry.review?.rating}</span>
                  <span className="text-[10px]">💎</span>
                </div>
              </div>

              {entry.review?.recommendedDishes && entry.review.recommendedDishes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.review.recommendedDishes.slice(0, 3).map((dish, idx) => (
                    <span key={idx} className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800 uppercase">
                      ✓ {dish}
                    </span>
                  ))}
                </div>
              )}

              {entry.note && (
                <p className="text-[10px] text-darkblue/60 dark:text-cream/60 font-medium italic line-clamp-2 border-t border-beigegray/10 pt-3 mt-1">
                  "{entry.note}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
