
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CuisineType, CraveType, FoodEntry, UnifiedInsight, PetState, PetType, RestaurantReview, Language, Theme, MoodType, PatternAnalysis } from './types';
import { getFoodInsight, generatePetImage, getDailyMoodInsight } from './services/geminiService';
import { storageService } from './services/storageService';
import { DiscoveryView } from './components/DiscoveryView';
import { ReviewView } from './components/ReviewView';
import { NavIcons, AppIcons } from './components/Icons';
import { PetDisplay } from './components/PetDisplay';
import { PetSelector } from './components/PetSelector';
import { ReportView } from './components/ReportView';
import { LiveTreeHole } from './components/LiveTreeHole';
import { SettingsView } from './components/SettingsView';
import { MoodSelector } from './components/MoodSelector';
import { InsightCard } from './components/InsightCard';
import { PatternAlert } from './components/PatternAlert';
import { translations } from './translations';

const Dashboard: React.FC<{
  pet: PetState | null;
  lang: Language;
  isLoading: boolean;
  history: FoodEntry[];
  currentMood: MoodType | null;
  dailyInsight: UnifiedInsight | null;
  isInsightLoading: boolean;
  onMoodSelect: (mood: MoodType) => void;
}> = ({ pet, lang, isLoading, history, currentMood, dailyInsight, isInsightLoading, onMoodSelect }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  return (
    <div className="pb-40 fade-in relative z-10">
      <header className="px-10 pt-16 pb-6 text-center">
        <h1 className="text-3xl font-black text-darkblue dark:text-white tracking-tighter uppercase leading-none">{t.greeting}</h1>
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em] mt-3">Neural Guardian Interface</p>
      </header>

      <div className="px-6 mb-10">
        <div className="bg-white dark:bg-midnight-card rounded-[3rem] p-1.5 shadow-2xl border border-slate-100 dark:border-white/5">
           <MoodSelector onSelect={onMoodSelect} selectedMood={currentMood} lang={lang} />
        </div>
      </div>

      {pet && (
        <div className="relative">
          <PetDisplay 
            pet={pet} 
            currentMood={currentMood} 
            isUpdating={isLoading}
            lang={lang}
            petMessage={dailyInsight?.refinedEmotion ? `${translations[lang].soulLink}: ${dailyInsight.refinedEmotion}` : undefined}
          />
          <button onClick={() => setIsLiveOpen(true)} className="absolute bottom-16 right-10 w-16 h-16 bg-darkblue dark:bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-90 z-20">
            {AppIcons.mic('w-6 h-6')}
          </button>
        </div>
      )}

      {(currentMood || isInsightLoading) && (
        <div className="mt-6">
           <InsightCard insight={dailyInsight!} isLoading={isInsightLoading} lang={lang} />
        </div>
      )}

      <div className="px-8 grid grid-cols-2 gap-5 mt-4">
        <button onClick={() => navigate('/discover')} className="p-8 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 text-left active:scale-[0.98] transition-all group">
          <div className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
            {AppIcons.search()}
          </div>
          <h3 className="text-sm font-black text-darkblue dark:text-white tracking-tight uppercase mb-1">{t.discoveryTitle}</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t.discoveryBtn}</p>
        </button>
        <button onClick={() => navigate('/review')} className="p-8 bg-darkblue dark:bg-indigo-600 text-white rounded-[3rem] text-left active:scale-[0.98] transition-all group shadow-xl">
          <div className="w-8 h-8 text-white/40 mb-4 group-hover:scale-110 transition-transform">
            {AppIcons.archive()}
          </div>
          <h3 className="text-sm font-black text-white tracking-tight uppercase mb-1">{t.reviewTitle}</h3>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{t.reviewBtn}</p>
        </button>
      </div>
      {isLiveOpen && pet && <LiveTreeHole lang={lang} petType={pet.type} petImageUrl={pet.imageUrl} onClose={() => setIsLiveOpen(false)} />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [history, setHistory] = useState<FoodEntry[]>([]);
  const [pet, setPet] = useState<PetState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [dailyInsight, setDailyInsight] = useState<UnifiedInsight | null>(null);
  const [currentFoodInsight, setCurrentFoodInsight] = useState<UnifiedInsight | null>(null);
  const [patternAlert, setPatternAlert] = useState<PatternAnalysis | null>(null);
  const [lang, setLang] = useState<Language>('en'); 
  const [theme, setTheme] = useState<Theme>('light');
  
  const navigate = useNavigate();
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    // Initial Data Sync from the storage engine
    const savedHistory = storageService.getHistory();
    const savedPet = storageService.getPet();
    const savedTheme = localStorage.getItem('moodflow_theme') as Theme;
    const savedLang = localStorage.getItem('moodflow_lang') as Language;
    const savedMood = localStorage.getItem('moodflow_last_mood') as MoodType;
    const lastOpened = localStorage.getItem('moodflow_last_opened');
    
    setHistory(savedHistory);
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLang(savedLang);
    
    if (savedMood) {
      setCurrentMood(savedMood);
      if (!initialized.current) {
        handleMoodSelect(savedMood, true, savedLang || 'en');
        initialized.current = true;
      }
    }

    if (savedPet) {
      let petData = savedPet;
      const now = Date.now();
      if (lastOpened) {
        const lastTime = parseInt(lastOpened);
        const daysPassed = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));
        if (daysPassed >= 1) {
          petData.hp = Math.max(0, petData.hp - (daysPassed * 5));
          storageService.savePet(petData);
        }
      }
      setPet(petData);
      localStorage.setItem('moodflow_last_opened', now.toString());
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('moodflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('moodflow_lang', lang);
  }, [lang]);

  const handleMoodSelect = async (mood: MoodType, isInit: boolean = false, overrideLang?: Language) => {
    setCurrentMood(mood);
    if (!isInit) localStorage.setItem('moodflow_last_mood', mood);
    
    setIsInsightLoading(true);
    try {
      const insight = await getDailyMoodInsight(mood, history, overrideLang || lang);
      setDailyInsight(insight);
    } catch (e) { 
      console.error("Dashboard API Sync Error:", e); 
    } finally { 
      setIsInsightLoading(false); 
    }
  };

  const handleChefSubmit = async (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string, id?: string) => {
    if (!pet) return;
    setIsLoading(true);
    setCurrentFoodInsight(null);
    try {
      const insight = await getFoodInsight(cuisine, 'surprise', pet.type, note, lang, photo);
      setCurrentFoodInsight(insight);
      const entryId = id || Date.now().toString();
      const newEntry: FoodEntry = { 
        id: entryId, 
        date: new Date().toISOString(), 
        cuisine, 
        crave: 'surprise', 
        mood: currentMood || undefined, 
        note, 
        review, 
        insight, 
        keywords: insight.keywords 
      };
      
      const newHistory = id ? history.map(h => h.id === id ? newEntry : h) : [...history, newEntry];
      setHistory(newHistory);
      storageService.saveHistory(newHistory);
      
      setPet(prev => {
        if (!prev) return null;
        const updated = { ...prev, hp: Math.min(100, prev.hp + 5) };
        storageService.savePet(updated);
        return updated;
      });

      storageService.analyzePatterns(newEntry, history, lang).then(a => a && setPatternAlert(a));
    } catch (e) { 
      console.error("Data Archiving Error:", e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDeleteEntry = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    storageService.saveHistory(newHistory);
  };

  const handlePetSelect = async (type: PetType, customDesc?: string) => {
    setIsLoading(true);
    try {
      const imageUrl = await generatePetImage(type, customDesc);
      const initialPet: PetState = { type, customDescription: customDesc, hp: 100, level: 1, name: type, imageUrl };
      setPet(initialPet);
      storageService.savePet(initialPet);
      localStorage.setItem('moodflow_last_opened', Date.now().toString());
    } finally { setIsLoading(false); }
  };

  return (
    <div className={`max-w-md mx-auto h-full ${theme === 'dark' ? 'bg-midnight-bg text-cream' : 'bg-cream text-darkblue'} flex flex-col relative overflow-hidden shadow-2xl`}>
      {!pet && <PetSelector onSelect={handlePetSelect} isLoading={isLoading} lang={lang} />}
      <div className="flex-1 overflow-y-auto pt-safe pb-32 relative z-10 no-scrollbar">
        <Routes>
          <Route path="/" element={<Dashboard pet={pet} lang={lang} isLoading={isLoading} history={history} currentMood={currentMood} dailyInsight={dailyInsight} isInsightLoading={isInsightLoading} onMoodSelect={handleMoodSelect} />} />
          <Route path="/discover" element={<DiscoveryView lang={lang} history={history} currentMood={currentMood} />} />
          <Route path="/review" element={<ReviewView lang={lang} isLoading={isLoading} history={history} onSubmit={handleChefSubmit} onDelete={handleDeleteEntry} currentInsight={currentFoodInsight} />} />
          <Route path="/stats" element={<ReportView history={history} lang={lang} />} />
          <Route path="/settings" element={<SettingsView lang={lang} theme={theme} pet={pet} isUpdatingPet={false} onToggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onResetData={() => {localStorage.clear(); window.location.reload();}} onUpdateKey={() => {}} onUpdatePetProfile={() => {}} onRegenerateImage={() => {}} />} />
        </Routes>
      </div>
      {patternAlert && <PatternAlert analysis={patternAlert} onClose={() => setPatternAlert(null)} lang={lang} />}
      
      <nav className="glass fixed bottom-0 w-full max-w-md z-40 border-t border-slate-100 dark:border-white/5 pb-safe">
        <div className="flex justify-around items-center h-20 px-4">
          <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${location.pathname === '/' ? (theme === 'dark' ? 'text-indigo-400' : 'text-darkblue') : 'text-slate-300 dark:text-slate-700'}`}>
            {NavIcons.home('w-6 h-6')}<span className="text-[8px] font-black uppercase tracking-widest">{translations[lang].guardian}</span>
          </button>
          <button onClick={() => navigate('/discover')} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${location.pathname === '/discover' ? (theme === 'dark' ? 'text-indigo-400' : 'text-darkblue') : 'text-slate-300 dark:text-slate-700'}`}>
            {AppIcons.search('w-6 h-6')}<span className="text-[8px] font-black uppercase tracking-widest">{translations[lang].discoveryBtn}</span>
          </button>
          <button onClick={() => navigate('/review')} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${location.pathname === '/review' ? (theme === 'dark' ? 'text-indigo-400' : 'text-darkblue') : 'text-slate-300 dark:text-slate-700'}`}>
            {AppIcons.archive('w-6 h-6')}<span className="text-[8px] font-black uppercase tracking-widest">{translations[lang].reviewBtn}</span>
          </button>
          <button onClick={() => navigate('/stats')} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${location.pathname === '/stats' ? (theme === 'dark' ? 'text-indigo-400' : 'text-darkblue') : 'text-slate-300 dark:text-slate-700'}`}>
            {NavIcons.stats('w-6 h-6')}<span className="text-[8px] font-black uppercase tracking-widest">{translations[lang].stats}</span>
          </button>
          <button onClick={() => navigate('/settings')} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${location.pathname === '/settings' ? (theme === 'dark' ? 'text-indigo-400' : 'text-darkblue') : 'text-slate-300 dark:text-slate-700'}`}>
            {NavIcons.settings('w-6 h-6')}<span className="text-[8px] font-black uppercase tracking-widest">{translations[lang].settings}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => <Router><AppContent /></Router>;
export default App;
