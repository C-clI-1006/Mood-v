
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MoodType, MoodEntry, DailyInsight } from './types';
import { getMoodInsight } from './services/geminiService';
import { MoodSelector } from './components/MoodSelector';
import { InsightCard } from './components/InsightCard';
import { NavIcons, MoodIcons } from './components/Icons';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

// --- Stats Component ---
const StatsView: React.FC<{ history: MoodEntry[] }> = ({ history }) => {
  const moodScore: Record<MoodType, number> = {
    energetic: 5,
    happy: 4,
    calm: 3,
    neutral: 2,
    anxious: 1,
    sad: 0
  };

  const chartData = history.slice(-7).map(h => ({
    name: new Date(h.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
    score: moodScore[h.mood],
    fullDate: new Date(h.date).toLocaleDateString()
  }));

  return (
    <div className="p-6 pb-32 pt-16 animate-in fade-in duration-500">
      <h2 className="text-2xl font-extrabold mb-6 tracking-tight">心情趋势</h2>
      
      {history.length > 0 ? (
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 h-64 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }} 
              />
              <YAxis hide domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] text-center mb-8 border border-dashed border-gray-200">
          <p className="text-gray-400 italic text-sm">暂无足够数据生成图表</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 px-2 uppercase text-xs tracking-widest opacity-50">历史足迹</h3>
        {history.length === 0 ? (
          <p className="text-gray-400 text-center py-8 italic text-sm">从记录今天的心情开始吧 ✨</p>
        ) : (
          history.slice().reverse().map(entry => (
            <div key={entry.id} className="bg-white p-5 rounded-3xl flex items-center gap-4 shadow-sm border border-gray-50 active:scale-[0.98] transition-transform">
              <div className="p-3 bg-gray-50 rounded-2xl">
                {MoodIcons[entry.mood]('w-8 h-8 text-indigo-600')}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{new Date(entry.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-gray-400 font-medium">{entry.insight?.affirmation.slice(0, 25)}...</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Home View ---
const Home: React.FC<{
  onMoodSubmit: (mood: MoodType) => void;
  isLoading: boolean;
  currentInsight: DailyInsight | null;
  hasSubmittedToday: boolean;
  error: string | null;
}> = ({ onMoodSubmit, isLoading, currentInsight, hasSubmittedToday, error }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  return (
    <div className="pb-32 pt-safe">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">你好 👋</h1>
        <p className="text-gray-500 mt-2 font-medium text-lg">今天感觉怎么样？</p>
      </header>

      {error && (
        <div className="mx-6 mb-6 p-5 bg-red-50 border border-red-100 rounded-[2rem] text-red-700 text-sm animate-in fade-in zoom-in-95">
          <p className="font-bold flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span> 网络连接受限
          </p>
          <p className="opacity-80 leading-relaxed">无法连接到 AI 服务。请确保您的网络环境（如 VPN）已开启并能访问 Google 服务。</p>
        </div>
      )}

      {!hasSubmittedToday ? (
        <div className="animate-in slide-in-from-bottom-8 duration-700 ease-out">
          <MoodSelector onSelect={setSelectedMood} selectedMood={selectedMood} />
          <div className="px-6 mt-6">
            <button
              disabled={!selectedMood || isLoading}
              onClick={() => selectedMood && onMoodSubmit(selectedMood)}
              className={`w-full py-5 rounded-[2.5rem] font-bold text-xl shadow-2xl transition-all active:scale-95 ${
                selectedMood && !isLoading 
                  ? 'bg-gray-900 text-white shadow-gray-300' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在为你生成建议...
                </span>
              ) : '记录心情'}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-700 px-6">
           <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-4">
             <div className="bg-indigo-600 rounded-full p-2 shadow-lg shadow-indigo-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
             </div>
             <div>
               <p className="text-indigo-900 font-bold">今日已打卡</p>
               <p className="text-indigo-700 text-xs opacity-70">明天再来记录新的心情吧</p>
             </div>
           </div>
        </div>
      )}

      {(currentInsight || isLoading) && (
        <div className="animate-in slide-in-from-bottom-4 duration-1000">
          <InsightCard insight={currentInsight!} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

// --- App Root ---
const AppContent: React.FC = () => {
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInsight, setCurrentInsight] = useState<DailyInsight | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('moodflow_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        const todayStr = new Date().toDateString();
        const todayEntry = parsed.find((e: MoodEntry) => new Date(e.date).toDateString() === todayStr);
        if (todayEntry?.insight) setCurrentInsight(todayEntry.insight);
      } catch (e) { console.error("Data load failed", e); }
    }
  }, []);

  const handleMoodSubmit = async (mood: MoodType) => {
    setIsLoading(true);
    setError(null);
    try {
      const recentMoods = history.slice(-5).map(h => h.mood);
      const insight = await getMoodInsight(mood, recentMoods);
      
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mood,
        insight
      };

      const newHistory = [...history, newEntry];
      setHistory(newHistory);
      localStorage.setItem('moodflow_data', JSON.stringify(newHistory));
      setCurrentInsight(insight);
    } catch (err: any) {
      setError(err.message || "请求失败");
    } finally {
      setIsLoading(false);
    }
  };

  const hasSubmittedToday = history.some(e => new Date(e.date).toDateString() === new Date().toDateString());

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home onMoodSubmit={handleMoodSubmit} isLoading={isLoading} currentInsight={currentInsight} hasSubmittedToday={hasSubmittedToday} error={error} />} />
          <Route path="/stats" element={<StatsView history={history} />} />
          <Route path="/settings" element={
            <div className="p-6 pt-16 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-8">设置</h2>
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">📱</span> 安装到 iPhone
                  </h3>
                  <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                    <p className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">1</span>
                      <span>点击 Safari 底部的 <strong className="text-indigo-600">分享按钮</strong> (↑)</span>
                    </p>
                    <p className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">2</span>
                      <span>选择 <strong className="text-indigo-600">“添加到主屏幕”</strong></span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-gray-100">
                  <button 
                    onClick={() => { if(confirm('清除后本地记录将永久丢失，确定吗？')) { setHistory([]); localStorage.clear(); setCurrentInsight(null); } }}
                    className="w-full text-left text-red-500 font-bold p-5 active:bg-red-50 rounded-3xl transition-colors"
                  >
                    清除所有本地数据
                  </button>
                </div>

                <div className="mt-8 text-center px-4">
                  <p className="text-gray-300 text-[10px] uppercase tracking-[0.2em] font-bold">MoodFlow v1.2.0</p>
                  <p className="text-gray-200 text-[10px] mt-2 italic">私密、本地、由 Gemini AI 驱动</p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>

      <nav className="glass border-t border-gray-200/50 safe-area-bottom">
        <div className="flex justify-around items-center p-4">
          {[
            { path: '/', icon: NavIcons.home, label: '首页' },
            { path: '/stats', icon: NavIcons.stats, label: '趋势' },
            { path: '/settings', icon: NavIcons.settings, label: '设置' }
          ].map((item) => {
            const isActive = (item.path === '/' && (location.pathname === '/' || location.pathname === '')) || location.pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)} 
                className={`flex flex-col items-center gap-1 transition-all px-6 relative ${isActive ? 'text-indigo-600' : 'text-gray-300'}`}
              >
                {item.icon(`w-6 h-6 ${isActive ? 'scale-110' : ''}`)}
                <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                {isActive && <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
