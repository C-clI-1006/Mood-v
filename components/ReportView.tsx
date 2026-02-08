
import React, { useState, useEffect, useMemo } from 'react';
import { FoodEntry, ReportData, CuisineType, Language } from '../types';
import { generateReport } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { translations } from '../translations';
import { AppIcons } from './Icons';

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
      generateReport(history, 'weekly', lang)
        .then(setReport)
        .catch(err => console.error("Neural Report Sync Failed", err))
        .finally(() => setIsLoading(false));
    }
  }, [history, lang]);

  const cuisineData = useMemo(() => {
    const counts: any = {};
    history.forEach(h => counts[h.cuisine] = (counts[h.cuisine] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value: value as number }));
  }, [history]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in h-full">
      <div className="text-6xl mb-6 opacity-10 grayscale">📔</div>
      <p className="text-beigegray font-black uppercase tracking-[0.4em] text-[10px]">{t.noLogs}</p>
    </div>
  );

  return (
    <div className="px-8 pt-12 pb-40 space-y-10 animate-in fade-in no-scrollbar overflow-y-auto h-full">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-darkblue dark:text-cream tracking-tighter uppercase">{t.stats}</h2>
          <p className="text-[10px] font-bold text-beigegray uppercase tracking-[0.5em] mt-2">Biometric Soul Sync</p>
        </div>
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
           {AppIcons.archive('w-6 h-6')}
        </div>
      </header>

      {/* Mood Volatility Chart (The "Wave") */}
      <div className="bg-white dark:bg-midnight-card p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden min-h-[350px]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-[80px]" />
        
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-darkblue dark:text-cream uppercase tracking-[0.4em]">{t.moodTrend}</span>
           </div>
           {isLoading && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
        </div>
        
        <div className="h-56 w-full relative">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart 
               data={report?.moodTrend || []} 
               margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
             >
               <defs>
                 <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#818CF8" stopOpacity={0.5}/>
                   <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Tooltip 
                 contentStyle={{ backgroundColor: '#0D1B2A', border: 'none', borderRadius: '1.5rem', fontSize: '10px', color: '#fff', fontWeight: 'bold', padding: '12px' }}
                 itemStyle={{ color: '#818CF8' }}
                 cursor={{ stroke: '#818CF8', strokeWidth: 1, strokeDasharray: '5 5' }}
               />
               <Area 
                 type="monotone" 
                 dataKey="value" 
                 stroke="#818CF8" 
                 strokeWidth={5} 
                 fillOpacity={1} 
                 fill="url(#moodGradient)" 
                 animationDuration={2000}
                 isAnimationActive={true}
                 connectNulls
               />
               <XAxis dataKey="date" hide />
               <YAxis hide domain={[0, 6]} />
             </AreaChart>
           </ResponsiveContainer>
        </div>
        
        {report?.emotionalInsight && (
          <div className="mt-10 pt-8 border-t border-slate-50 dark:border-white/5">
             <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧠</span>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t.emotionalInsight}</span>
             </div>
             <p className="text-[13px] font-bold leading-relaxed italic text-slate-800 dark:text-slate-300">
               "{report.emotionalInsight}"
             </p>
          </div>
        )}
      </div>

      {/* Cuisine Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-midnight-card p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-[10px] font-black text-darkblue dark:text-cream uppercase tracking-[0.4em] block mb-10">{lang === 'zh' ? '味觉分布' : 'Taste Map'}</span>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cuisineData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" animationDuration={1000}>
                  {cuisineData.map((entry, index) => <Cell key={index} fill={COLORS[entry.name] || '#ccc'} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-4 mt-10">
            {cuisineData.map(d => (
              <div key={d.name} className="flex items-center gap-3 text-[10px] font-bold">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name] }} />
                <span className="text-darkblue/70 dark:text-cream/70 uppercase tracking-wider">{t[d.name as CuisineType]}</span>
                <span className="ml-auto text-darkblue dark:text-cream font-black mr-2">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="space-y-6">
          <div className="bg-darkblue dark:bg-indigo-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute bottom-0 right-0 p-6 opacity-10">{AppIcons.sparkles('w-32 h-32')}</div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] block mb-6">{lang === 'zh' ? '主导频率' : 'Dominant Freq'}</span>
            <div className="flex items-center gap-6">
               <div className="text-6xl drop-shadow-2xl">{CUISINE_ICONS[report?.dominantCuisine || 'Other']}</div>
               <div className="flex-1">
                 <h4 className="text-2xl font-black tracking-tighter uppercase">{t[report?.dominantCuisine || 'Other']}</h4>
                 <p className="text-[12px] text-white/70 leading-relaxed mt-2 line-clamp-4">{report?.summary || "Analyzing sensory data..."}</p>
               </div>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-500/5 p-10 rounded-[3.5rem] border border-amber-100 dark:border-amber-500/10">
            <div className="flex items-center gap-3 mb-4">
               <span className="text-2xl">👨‍🍳</span>
               <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t.chefAdvice}</span>
            </div>
            <p className="text-[13px] font-bold leading-relaxed italic text-amber-900/80 dark:text-amber-200/80">"{report?.chefAdvice || "Syncing flavor profiles..."}"</p>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">{lang === 'zh' ? '时空轨迹' : 'Temporal Trajectory'}</span>
        </div>
        <div className="grid gap-4">
          {sortedHistory.slice(0, 5).map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-midnight-card p-6 rounded-[3rem] border border-slate-100 dark:border-white/5 flex items-center gap-5 shadow-sm transition-all hover:translate-x-1 active:scale-[0.98]">
              <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                {CUISINE_ICONS[entry.cuisine]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-black text-darkblue dark:text-white truncate uppercase tracking-tight">
                  {entry.review?.restaurantName || 'Neural Node'}
                </span>
                <span className="block text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1.5">
                  {new Date(entry.date).toLocaleDateString()} • {t[entry.mood || 'neutral']}
                </span>
              </div>
              <div className="text-[11px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-2xl">
                 {entry.review?.rating || 5}💎
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
