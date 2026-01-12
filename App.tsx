
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CuisineType, CraveType, FoodEntry, FoodInsight, PetState, PetType, RestaurantReview, Language, Theme, GroundingPlace, PetAccessory } from './types';
import { getFoodInsight, generatePetImage } from './services/geminiService';
import { DiscoveryView } from './components/DiscoveryView';
import { ReviewView } from './components/ReviewView';
import { NavIcons } from './components/Icons';
import { PetDisplay } from './components/PetDisplay';
import { PetSelector } from './components/PetSelector';
import { ReportView } from './components/ReportView';
import { LiveTreeHole } from './components/LiveTreeHole';
import { SettingsView } from './components/SettingsView';
import { translations } from './translations';

const Dashboard: React.FC<{
  pet: PetState | null;
  lang: Language;
  isLoading: boolean;
  onUpdateAccessory: (acc: PetAccessory) => void;
  onToggleSleep: () => void;
}> = ({ pet, lang, isLoading, onUpdateAccessory, onToggleSleep }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  return (
    <div className="pb-32 fade-in relative z-10">
      <header className="px-8 pt-12 pb-4 text-center">
        <h1 className="text-2xl font-black text-darkblue dark:text-cream tracking-tighter">{t.greeting}</h1>
        <p className="text-[9px] font-bold text-beigegray uppercase tracking-[0.4em] mt-1">Culinary Dashboard</p>
      </header>

      {pet && (
        <div className="relative">
          <PetDisplay 
            pet={pet} 
            currentMood={null} 
            onUpdateAccessory={onUpdateAccessory} 
            onToggleSleep={onToggleSleep} 
            isUpdating={isLoading}
            lang={lang}
          />
          <button onClick={() => setIsLiveOpen(true)} className="absolute bottom-16 right-12 w-14 h-14 bg-darkblue text-white rounded-full shadow-2xl flex items-center justify-center text-xl active:scale-90 transition-transform z-10">
            🎙️
          </button>
        </div>
      )}

      {/* 每日正能量推送版块 */}
      <div className="px-8 mb-6">
        <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[2.5rem] border border-beigegray/30 shadow-sm">
           <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{t.positiveNews}</span>
              <div className="h-px flex-1 bg-amber-500/20" />
           </div>
           <p className="text-xs font-bold text-darkblue dark:text-cream/80 leading-relaxed italic">
             “今日份好运：当你用心品味一顿美餐时，整个宇宙都在为你庆祝这份纯粹的快乐。”
           </p>
        </div>
      </div>

      <div className="px-8 grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/discover')}
          className="p-6 bg-amber-100 dark:bg-amber-900/30 rounded-[2.5rem] border border-amber-200 dark:border-amber-800 text-left group active:scale-95 transition-all"
        >
          <span className="text-2xl mb-2 block">🔍</span>
          <h3 className="text-sm font-black text-darkblue dark:text-white tracking-tighter">{t.discoveryTitle}</h3>
          <p className="text-[9px] text-amber-800/60 font-medium uppercase mt-1">{t.discoveryBtn}</p>
        </button>

        <button 
          onClick={() => navigate('/review')}
          className="p-6 bg-darkblue text-cream rounded-[2.5rem] text-left group active:scale-95 transition-all"
        >
          <span className="text-2xl mb-2 block">📔</span>
          <h3 className="text-sm font-black text-cream tracking-tighter">{t.reviewTitle}</h3>
          <p className="text-[9px] text-cream/40 font-medium uppercase mt-1">{t.reviewBtn}</p>
        </button>
      </div>
      
      {isLiveOpen && pet && <LiveTreeHole lang={lang} petType={pet.type} onClose={() => setIsLiveOpen(false)} />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [history, setHistory] = useState<FoodEntry[]>([]);
  const [pet, setPet] = useState<PetState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<FoodInsight | null>(null);
  const [lang, setLang] = useState<Language>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('chef_v3_history');
    const savedPet = localStorage.getItem('chef_v3_pet');
    if (saved) setHistory(JSON.parse(saved));
    if (savedPet) setPet(JSON.parse(savedPet));
  }, []);

  const handleUpdateAccessory = (accessory: PetAccessory) => {
    if (!pet) return;
    const newPet = { ...pet, accessory };
    setPet(newPet);
    localStorage.setItem('chef_v3_pet', JSON.stringify(newPet));
  };

  const handleToggleSleep = () => {
    if (!pet) return;
    const newPet = { ...pet, isSleeping: !pet.isSleeping };
    setPet(newPet);
    localStorage.setItem('chef_v3_pet', JSON.stringify(newPet));
  };

  const handleChefSubmit = async (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string) => {
    if (!pet) return;
    setIsLoading(true);
    setCurrentInsight(null);
    const defaultCrave: CraveType = 'surprise';
    try {
      const insight = await getFoodInsight(cuisine, defaultCrave, pet.type, note, lang, photo);
      setCurrentInsight(insight);
      const newEntry: FoodEntry = { id: Date.now().toString(), date: new Date().toISOString(), cuisine, crave: defaultCrave, note, review, insight, keywords: insight.keywords };
      const newHistory = [...history, newEntry];
      setHistory(newHistory);
      localStorage.setItem('chef_v3_history', JSON.stringify(newHistory));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handlePetSelect = async (type: PetType, customDesc?: string) => {
    setIsLoading(true);
    try {
      const imageUrl = await generatePetImage(type, 'none', customDesc);
      const initialPet: PetState = { type, customDescription: customDesc, hp: 100, level: 1, name: type, accessory: 'none', imageUrl };
      setPet(initialPet);
      localStorage.setItem('chef_v3_pet', JSON.stringify(initialPet));
    } finally { setIsLoading(false); }
  };

  return (
    <div className={`max-w-md mx-auto h-full ${theme === 'dark' ? 'bg-[#0D1B2A] text-cream' : 'bg-cream text-darkblue'} flex flex-col relative overflow-hidden shadow-2xl`}>
      {!pet && <PetSelector onSelect={handlePetSelect} isLoading={isLoading} />}
      
      <div className="flex-1 overflow-y-auto pt-safe pb-24 relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard pet={pet} lang={lang} isLoading={isLoading} onUpdateAccessory={handleUpdateAccessory} onToggleSleep={handleToggleSleep} />} />
          <Route path="/discover" element={<DiscoveryView lang={lang} history={history} />} />
          <Route path="/review" element={<ReviewView lang={lang} isLoading={isLoading} onSubmit={handleChefSubmit} currentInsight={currentInsight} />} />
          <Route path="/stats" element={<ReportView history={history} lang={lang} />} />
          <Route path="/settings" element={<SettingsView lang={lang} theme={theme} pet={pet} isUpdatingPet={false} onToggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onResetData={() => {localStorage.clear(); window.location.reload();}} onUpdateKey={() => {}} onUpdatePetProfile={() => {}} onRegenerateImage={() => {}} />} />
        </Routes>
      </div>

      <nav className="glass border-t border-beigegray/30 fixed bottom-0 w-full max-w-md z-40">
        <div className="flex justify-around items-center h-20">
          <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-darkblue' : 'text-beigegray'}`}>
            {NavIcons.home('w-5 h-5')}<span className="text-[9px] font-black uppercase">{translations[lang].guardian}</span>
          </button>
          <button onClick={() => navigate('/discover')} className={`flex flex-col items-center gap-1 ${location.pathname === '/discover' ? 'text-darkblue' : 'text-beigegray'}`}>
            <span className="text-xl">🔍</span><span className="text-[9px] font-black uppercase">{translations[lang].discoveryBtn}</span>
          </button>
          <button onClick={() => navigate('/review')} className={`flex flex-col items-center gap-1 ${location.pathname === '/review' ? 'text-darkblue' : 'text-beigegray'}`}>
            <span className="text-xl">📔</span><span className="text-[9px] font-black uppercase">{translations[lang].reviewBtn}</span>
          </button>
          <button onClick={() => navigate('/stats')} className={`flex flex-col items-center gap-1 ${location.pathname === '/stats' ? 'text-darkblue' : 'text-beigegray'}`}>
            {NavIcons.stats('w-5 h-5')}<span className="text-[9px] font-black uppercase">{translations[lang].stats}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => <Router><AppContent /></Router>;
export default App;
