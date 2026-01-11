
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MoodType, MoodEntry, DailyInsight, PetState, PetType, PetAccessory, Language, Theme } from './types';
import { getMoodInsight, generatePetImage } from './services/geminiService';
import { MoodSelector } from './components/MoodSelector';
import { InsightCard } from './components/InsightCard';
import { NavIcons } from './components/Icons';
import { PetDisplay } from './components/PetDisplay';
import { PetSelector } from './components/PetSelector';
import { ReportView } from './components/ReportView';
import { LiveTreeHole } from './components/LiveTreeHole';
import { translations } from './translations';

const BackgroundMoodEffects: React.FC<{ mood: MoodType | null }> = ({ mood }) => {
  const bubbles = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      size: Math.random() * 80 + 40,
      left: Math.random() * 100,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 5,
    }));
  }, []);

  if (!mood) return null;

  const isPositive = mood === 'happy' || mood === 'energetic';
  const isNegative = mood === 'sad' || mood === 'anxious';
  const isNeutral = mood === 'calm' || mood === 'neutral';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {isPositive && (
        <>
          {bubbles.map((b) => (
            <div
              key={b.id}
              className="absolute bg-white/20 dark:bg-white/5 rounded-full animate-bubble-rise"
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                left: `${b.left}%`,
                bottom: '-15%',
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </>
      )}
      {isNegative && (
        <div 
          className="absolute inset-0 bg-rose-500/10 dark:bg-rose-900/15 animate-bg-pulse"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
      {isNeutral && (
        <div 
          className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-900/10 animate-slow-breath"
        />
      )}
    </div>
  );
};

const Home: React.FC<{
  onMoodSubmit: (mood: MoodType, note: string, img?: string) => void;
  isLoading: boolean;
  isPetUpdating: boolean;
  currentInsight: DailyInsight | null;
  error: string | null;
  pet: PetState | null;
  history: MoodEntry[];
  onUpdateAccessory: (acc: PetAccessory) => void;
  lang: Language;
  theme: Theme;
  onOpenKey: () => void;
  onCurrentMoodChange: (mood: MoodType | null) => void;
}> = ({ onMoodSubmit, isLoading, isPetUpdating, currentInsight, error, pet, history, onUpdateAccessory, lang, theme, onOpenKey, onCurrentMoodChange }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const todayEntries = history.filter(e => new Date(e.date).toDateString() === new Date().toDateString());
  const displayMood = selectedMood || (todayEntries.length > 0 ? todayEntries[todayEntries.length - 1].mood : null);

  useEffect(() => {
    onCurrentMoodChange(displayMood);
  }, [displayMood, onCurrentMoodChange]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isPermissionError = error === "API_PERMISSION_DENIED";

  return (
    <div className="pb-32 fade-in relative z-10">
      <header className="px-8 pt-12 pb-4 text-center">
        <h1 className="text-2xl font-light text-deepblue dark:text-gray-100 tracking-tight">{t.greeting}</h1>
        <p className="text-[9px] font-bold text-beigegray dark:text-gray-600 uppercase tracking-[0.3em] mt-1">
          Soul Sanctuary
        </p>
      </header>

      {pet && (
        <div className="relative">
          <PetDisplay 
            pet={pet} 
            currentMood={displayMood} 
            onUpdateAccessory={onUpdateAccessory}
            isUpdating={isPetUpdating || isLoading}
            petMessage={currentInsight?.petMessage}
            lang={lang}
          />
          
          <button 
            onClick={() => setIsLiveOpen(true)}
            className="absolute bottom-2 right-12 w-14 h-14 bg-darkblue text-white rounded-full shadow-xl flex items-center justify-center text-xl active:scale-90 transition-transform z-10"
          >
            🎙️
          </button>
        </div>
      )}

      {error && (
        <div className="mx-8 mb-6 p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-3xl text-center border border-rose-100 dark:border-rose-900/30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            {isPermissionError ? "Permission Required" : "Soul Link Error"}
          </p>
          <p className="text-xs font-medium mb-4">
            {isPermissionError 
              ? "Your current API key doesn't have permission for this model."
              : error}
          </p>
          {isPermissionError && (
            <button 
              onClick={onOpenKey}
              className="px-6 py-2 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Update API Key
            </button>
          )}
        </div>
      )}

      <div className="px-8 space-y-6 slide-up">
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-[9px] font-bold text-beigegray dark:text-gray-600 uppercase tracking-widest">{t.recordMood}</h2>
            {todayEntries.length > 0 && <span className="text-[9px] font-medium text-deepblue opacity-60">Logs: {todayEntries.length}</span>}
          </div>
          <MoodSelector onSelect={setSelectedMood} selectedMood={selectedMood} lang={lang} />
        </section>
        
        <section className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.moodNotePlaceholder}
            className="w-full p-5 rounded-3xl bg-beigegray/20 dark:bg-gray-800/40 border border-beigegray/30 dark:border-gray-700/50 shadow-sm outline-none text-sm h-28 dark:text-gray-200"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${image ? 'bg-darkblue text-white' : 'bg-cream dark:bg-gray-700 text-beigegray'}`}
          >
            📷
          </button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          {image && <img src={image} className="absolute top-4 right-4 w-8 h-8 rounded-lg object-cover border-2 border-white shadow-sm" />}
        </section>

        <button
          disabled={!selectedMood || isLoading || isPetUpdating}
          onClick={() => {
            if (selectedMood) {
              onMoodSubmit(selectedMood, note, image || undefined);
              setSelectedMood(null);
              setNote("");
              setImage(null);
            }
          }}
          className={`w-full py-4 rounded-full font-bold text-sm tracking-wide transition-all ${
            selectedMood && !isLoading && !isPetUpdating ? 'bg-darkblue text-white shadow-lg active:bg-black' : 'bg-beigegray/40 dark:bg-gray-800 text-beigegray'
          }`}
        >
          {isLoading ? t.depthAnalysis : todayEntries.length > 0 ? t.recordAnother : t.recordMood}
        </button>
      </div>

      {(currentInsight || isLoading) && (
        <div className="mt-12 slide-up">
          <InsightCard insight={currentInsight!} isLoading={isLoading} lang={lang} />
        </div>
      )}

      {isLiveOpen && pet && <LiveTreeHole lang={lang} petType={pet.type} onClose={() => setIsLiveOpen(false)} />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [pet, setPet] = useState<PetState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPetUpdating, setIsPetUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInsight, setCurrentInsight] = useState<DailyInsight | null>(null);
  const [lang, setLang] = useState<Language>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [currentMoodForBg, setCurrentMoodForBg] = useState<MoodType | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedMoods = localStorage.getItem('moodflow_v4_data');
    const savedPet = localStorage.getItem('moodflow_v4_pet');
    const savedLang = localStorage.getItem('moodflow_v4_lang') as Language;
    const savedTheme = localStorage.getItem('moodflow_v4_theme') as Theme;
    if (savedMoods) setHistory(JSON.parse(savedMoods));
    if (savedPet) setPet(JSON.parse(savedPet));
    if (savedLang) setLang(savedLang);
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    }

    if ((window as any).aistudio) {
      (window as any).aistudio.hasSelectedApiKey().then(setHasApiKey);
    }
  }, []);

  const handleOpenKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
      setError(null);
    }
  };

  const handleMoodSubmit = async (mood: MoodType, note: string, imgBase64?: string) => {
    if (!pet) return;
    setIsLoading(true);
    setCurrentInsight(null);
    setError(null);
    try {
      const insight = await getMoodInsight(mood, pet.type, note, lang, imgBase64);
      setCurrentInsight(insight);
      
      const newEntry: MoodEntry = { id: Date.now().toString(), date: new Date().toISOString(), mood, note, insight };
      const newHistory = [...history, newEntry];
      setHistory(newHistory);
      localStorage.setItem('moodflow_v4_data', JSON.stringify(newHistory));
    } catch (err: any) { 
      setError(err.message === "API_PERMISSION_DENIED" ? "API_PERMISSION_DENIED" : (err.message || "Soul sync failed.")); 
      console.error(err);
    } finally { 
      setIsLoading(false); 
    }
  };

  const toggleLang = () => {
    const next = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    localStorage.setItem('moodflow_v4_lang', next);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('moodflow_v4_theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleUpdateAccessory = async (acc: PetAccessory) => {
    if (!pet) return;
    setIsPetUpdating(true);
    setError(null);
    try {
      const imageUrl = await generatePetImage(pet.type, acc, pet.customDescription);
      const updatedPet = { ...pet, accessory: acc, imageUrl };
      setPet(updatedPet);
      localStorage.setItem('moodflow_v4_pet', JSON.stringify(updatedPet));
    } catch (e: any) {
      setError(e.message === "API_PERMISSION_DENIED" ? "API_PERMISSION_DENIED" : (e.message || "Failed to update appearance."));
      console.error(e);
    } finally {
      setIsPetUpdating(false);
    }
  };

  const handlePetSelect = async (type: PetType, customDesc?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const imageUrl = await generatePetImage(type, 'none', customDesc);
      const initialPet: PetState = { type, customDescription: customDesc, hp: 10, level: 1, name: type, accessory: 'none', imageUrl };
      setPet(initialPet);
      localStorage.setItem('moodflow_v4_pet', JSON.stringify(initialPet));
    } catch (err: any) { 
      setError(err.message === "API_PERMISSION_DENIED" ? "API_PERMISSION_DENIED" : (err.message || "Summoning failed.")); 
      console.error(err);
    } finally { 
      setIsLoading(false); 
    }
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-darkblue text-white p-12 text-center">
        <div className="text-6xl mb-8">🔑</div>
        <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Paid API Key Required</h2>
        <p className="mb-10 text-sm opacity-70 leading-relaxed">
          Please select a paid API key to unlock the 3D Soul Guardian.
        </p>
        <button 
          onClick={handleOpenKey} 
          className="px-10 py-5 bg-cream text-darkblue rounded-full font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-beigegray"
        >
          Select Project Key
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto h-full ${theme === 'dark' ? 'bg-[#0F1115] text-white' : 'bg-cream text-deepblue'} flex flex-col relative transition-colors duration-500 overflow-hidden shadow-2xl ring-1 ring-beigegray dark:ring-gray-800`}>
      <BackgroundMoodEffects mood={currentMoodForBg} />
      
      {!pet && <PetSelector onSelect={handlePetSelect} isLoading={isLoading} />}
      
      <div className="absolute top-10 right-8 flex gap-3 z-40">
        <button onClick={toggleLang} className="w-9 h-9 flex items-center justify-center rounded-full bg-deepblue/10 dark:bg-gray-800/40 backdrop-blur-xl border border-deepblue/20 text-[9px] font-bold uppercase text-deepblue">{lang}</button>
        <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-deepblue/10 dark:bg-gray-800/40 backdrop-blur-xl border border-deepblue/20 text-sm">{theme === 'light' ? '🌙' : '☀️'}</button>
      </div>

      <div className="flex-1 overflow-y-auto pt-safe pb-24 relative z-10">
        <Routes>
          <Route path="/" element={<Home {...{onMoodSubmit: handleMoodSubmit, isLoading, isPetUpdating, currentInsight, error, pet, history, onUpdateAccessory: handleUpdateAccessory, lang, theme, onOpenKey: handleOpenKey, onCurrentMoodChange: setCurrentMoodForBg}} />} />
          <Route path="/stats" element={<ReportView history={history} lang={lang} />} />
        </Routes>
      </div>

      <nav className="glass border-t border-beigegray/30 dark:border-gray-800/50 safe-area-bottom fixed bottom-0 w-full max-w-md z-40 backdrop-blur-2xl">
        <div className="flex justify-around items-center h-20">
          <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 w-20 transition-colors ${location.pathname === '/' ? 'text-deepblue' : 'text-beigegray'}`}>
            {NavIcons.home('w-5 h-5')}<span className="text-[9px] font-bold uppercase">{translations[lang].guardian}</span>
          </button>
          <button onClick={() => navigate('/stats')} className={`flex flex-col items-center gap-1 w-20 transition-colors ${location.pathname === '/stats' ? 'text-deepblue' : 'text-beigegray'}`}>
            {NavIcons.stats('w-5 h-5')}<span className="text-[9px] font-bold uppercase">{translations[lang].stats}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => <Router><AppContent /></Router>;
export default App;
