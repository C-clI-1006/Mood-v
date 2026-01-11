
import React, { useState, useEffect, useMemo } from 'react';
import { MoodEntry, ReportData, MoodType, Language } from '../types';
import { generateReport } from '../services/geminiService';
import { MoodIcons } from './Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { translations } from '../translations';

interface ReportViewProps {
  history: MoodEntry[];
  lang: Language;
}

const MOOD_COLORS: Record<MoodType, string> = {
  happy: '#FACC15',
  energetic: '#FB923C',
  calm: '#1B263B',
  neutral: '#EAE7DC',
  anxious: '#4A5568',
  sad: '#0D1B2A',
};

export const ReportView: React.FC<ReportViewProps> = ({ history, lang }) => {
  const t = translations[lang];
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async (p: 'weekly' | 'monthly' | 'yearly') => {
    if (history.length < 3) return;
    setIsLoading(true);
    try {
      const data = await generateReport(history, p, lang);
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (history.length >= 3) fetchReport(period);
  }, [period, lang]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(entry => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: t[name as MoodType],
      mood: name as MoodType,
      value
    }));
  }, [history, lang]);

  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      const entriesForDay = history.filter(e => new Date(e.date).toDateString() === dateStr);
      const mood = entriesForDay.length > 0 ? entriesForDay[entriesForDay.length - 1].mood : null;
      data.push({ date: d, mood });
    }
    return data;
  }, [history]);

  if (history.length < 3) {
    return (
      <div className="p-12 text-center h-full flex flex-col items-center justify-center bg-cream">
        <div className="text-5xl mb-6 text-darkblue">📊</div>
        <h3 className="text-xl font-black mb-4 text-darkblue">{t.noData}</h3>
        <p className="text-sm text-beigegray font-medium">{t.atLeastThree}</p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-32 pt-8 bg-cream min-h-full">
      <div className="flex bg-beigegray/30 p-1.5 rounded-full mb-8">
        {(['weekly', 'monthly', 'yearly'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
              period === p ? 'bg-darkblue text-cream shadow-sm' : 'text-beigegray'
            }`}
          >
            {t[p]}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <section className="bg-beigegray/20 p-8 rounded-[3rem] border border-beigegray/30 shadow-sm">
          <span className="text-[10px] font-black text-deepblue uppercase tracking-[0.4em] block mb-4">{t.moodDistribution}</span>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood]} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[10px] font-black text-beigegray uppercase">Total</span>
               <span className="text-2xl font-black text-deepblue">{history.length}</span>
            </div>
          </div>
        </section>

        <section className="bg-beigegray/20 p-8 rounded-[3rem] border border-beigegray/30 shadow-sm">
          <span className="text-[10px] font-black text-deepblue uppercase tracking-[0.4em] block mb-4">{t.moodHeatmap}</span>
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((d, i) => (
              <div key={i} className={`aspect-square rounded-lg transition-all duration-500 ${d.mood ? '' : 'bg-cream'}`} style={{ backgroundColor: d.mood ? MOOD_COLORS[d.mood] : undefined }} title={d.date.toLocaleDateString()} />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[9px] font-bold text-beigegray uppercase tracking-widest">
            <span>{t.daysAgo}</span>
            <span>{t.today}</span>
          </div>
        </section>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-40 bg-beigegray/30 rounded-[2.5rem] animate-pulse" />
          </div>
        ) : report ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-darkblue p-10 rounded-[3.5rem] text-cream flex flex-col items-center shadow-2xl">
              <span className="text-[10px] font-black text-cream/40 uppercase tracking-[0.4em] mb-6">{t.dominantTone}</span>
              <div className="bg-cream/10 p-6 rounded-full mb-6 relative">
                <div className="absolute inset-0 blur-2xl opacity-50 rounded-full" style={{ backgroundColor: MOOD_COLORS[report.dominantMood] }} />
                {MoodIcons[report.dominantMood as MoodType]?.('w-16 h-16 relative z-10')}
              </div>
              <h4 className="text-3xl font-black tracking-tighter capitalize">{t[report.dominantMood] || report.dominantMood}</h4>
            </div>

            <div className="bg-beigegray/20 p-8 rounded-[2.5rem] border border-beigegray/30">
              <span className="text-[10px] font-black text-darkblue uppercase tracking-[0.4em] block mb-4">{t.aiInsight}</span>
              <p className="text-darkblue font-bold text-lg leading-snug mb-4">{report.summary}</p>
              <div className="h-px bg-beigegray/50 mb-6" />
              <span className="text-[10px] font-black text-beigegray uppercase tracking-[0.4em] block mb-4">{t.trendAnalysis}</span>
              <p className="text-darkblue/80 text-sm leading-relaxed font-medium">{report.trendAnalysis}</p>
            </div>

            <div className="bg-darkblue p-8 rounded-[3rem] border border-black shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cream text-darkblue p-2 rounded-xl text-lg shadow-lg">💡</div>
                  <span className="text-[10px] font-black text-cream uppercase tracking-[0.4em]">{t.advice}</span>
               </div>
               <p className="text-cream font-bold text-sm leading-relaxed">{report.advice}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <button onClick={() => fetchReport(period)} className="px-8 py-4 bg-darkblue text-cream rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:bg-black">
              {t.regenerate}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
