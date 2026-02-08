
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CraveType, Language, GroundingPlace, FoodEntry, MoodType } from '../types';
import { FoodSelector } from './FoodSelector';
import { getDiscoveryRecommendations, searchRestaurants } from '../services/geminiService';
import { translations } from '../translations';
import { AppIcons } from './Icons';

const RestaurantCard: React.FC<{ 
  place: GroundingPlace; 
  index: number; 
  matchedEntry?: FoodEntry; 
  lang: Language;
}> = ({ place, index, matchedEntry, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchedEntry) {
      navigate(`/review?id=${matchedEntry.id}`);
    } else {
      const params = new URLSearchParams();
      params.set('prefill_name', place.title);
      navigate(`/review?${params.toString()}`);
    }
  };

  const vibeScore = place.vibeScore || 85;

  return (
    <div 
      className="group relative w-full bg-white dark:bg-midnight-card rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 mb-8"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="p-10 flex items-start justify-between gap-4 border-b border-slate-50 dark:border-white/5">
        <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black rounded-lg uppercase tracking-widest border border-indigo-500/5">{place.distance || 'Local'}</span>
              {matchedEntry && <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black rounded-lg uppercase tracking-widest border border-emerald-500/5">Visited</span>}
           </div>
           <h3 className="text-[22px] font-black text-slate-950 dark:text-white tracking-tight leading-snug uppercase line-clamp-2">
             {place.title}
           </h3>
        </div>

        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center mt-1">
           <svg className="absolute w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="35" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-white/5" />
              <circle cx="40" cy="40" r="35" fill="transparent" stroke="url(#gradient-vibe)" strokeWidth="5" strokeDasharray="220" strokeDashoffset={220 - (220 * vibeScore / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              <defs>
                <linearGradient id="gradient-vibe" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
           </svg>
           <div className="flex flex-col items-center">
             <span className="text-[15px] font-black text-slate-900 dark:text-white leading-none">{vibeScore}%</span>
             <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-1">Vibe</span>
           </div>
        </div>
      </div>

      <div className="p-10 space-y-8">
        <div className="relative">
           <p className="text-[14px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-indigo-500/20 pl-6 py-1">
             "{place.matchReason || "System identifies this coordinate as a neural resonance match for your current field."}"
           </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
             <div className="flex gap-3">
                {(place.keywords || ['Ambient', 'Curated']).slice(0, 3).map((k, i) => (
                  <span key={i} className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">#{k}</span>
                ))}
             </div>
             <div className="flex items-center gap-1.5 text-indigo-500">
                {AppIcons.diamond('w-3.5 h-3.5')}
                <span className="text-[11px] font-black text-slate-900 dark:text-white">{place.googleRating?.toFixed(1) || '4.5'}</span>
             </div>
          </div>

          <div className="flex gap-4">
             <button 
               onClick={handleAction}
               className="flex-1 py-5 bg-darkblue dark:bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all"
             >
               {matchedEntry ? t.viewReview : t.addLog}
             </button>
             <a 
               href={place.uri} 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-16 h-16 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-[2rem] flex items-center justify-center border border-slate-100 dark:border-white/10 active:scale-90 transition-all shadow-sm"
             >
               {AppIcons.map('w-5 h-5')}
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiscoveryView: React.FC<{ 
    lang: Language; 
    history: FoodEntry[]; 
    currentMood?: MoodType | null;
}> = ({ lang, history, currentMood }) => {
  const [recommendations, setRecommendations] = useState<GroundingPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCrave, setSelectedCrave] = useState<CraveType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const t = translations[lang];

  const handleCraveSearch = async (crave: CraveType) => {
    setSelectedCrave(crave);
    setIsSearching(true);
    setRecommendations([]);
    try {
      const results = await getDiscoveryRecommendations(lang, currentMood || undefined, crave);
      setRecommendations(results);
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedCrave(null);
    setIsSearching(true);
    setRecommendations([]);
    try {
      const results = await searchRestaurants(searchQuery, lang);
      setRecommendations(results);
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  return (
    <div className="px-6 pt-12 h-full flex flex-col no-scrollbar overflow-y-auto">
      <header className="mb-12 text-center">
        <div className="inline-block px-5 py-2 bg-indigo-500/5 text-indigo-500 rounded-full text-[8px] font-black uppercase tracking-[0.5em] mb-5 border border-indigo-500/10">
          {t.syncVibe}
        </div>
        <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-3 uppercase">
          {t.discoveryTitle}
        </h2>
        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 px-14 uppercase tracking-widest leading-relaxed">
          {t.discoveryDesc}
        </p>
      </header>

      <form onSubmit={handleTextSearch} className="mb-12 relative z-10">
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-[2.2rem] opacity-20 blur group-focus-within:opacity-40 transition-opacity" />
          <div className="relative flex items-center bg-white dark:bg-midnight-card border border-slate-100 dark:border-white/5 rounded-[2rem] px-8 py-5 shadow-2xl">
             <div className="w-6 h-6 mr-4 text-indigo-500 flex-shrink-0">
               {isSearching ? <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin" /> : AppIcons.search()}
             </div>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t.searchPlaceholder}
               className="flex-1 bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
             />
          </div>
        </div>
      </form>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">{t.vibeTitle}</span>
          {selectedCrave && (
            <button onClick={() => {setSelectedCrave(null); setRecommendations([])}} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Reset</button>
          )}
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
           <div className="flex gap-3">
              {(['comfort', 'healthy', 'spicy', 'sweet', 'social', 'surprise'] as CraveType[]).map((crave) => (
                <button
                  key={crave}
                  onClick={() => handleCraveSearch(crave)}
                  className={`flex-shrink-0 px-7 py-3.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${
                    selectedCrave === crave 
                      ? 'bg-darkblue border-darkblue text-white shadow-2xl scale-105' 
                      : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-300 dark:text-slate-700 hover:text-darkblue dark:hover:text-white'
                  }`}
                >
                  {t[crave]}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 pb-48">
        {isSearching ? (
          <div className="space-y-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full bg-slate-50 dark:bg-white/5 h-64 rounded-[3.5rem] animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="flex flex-col">
            {recommendations.map((place, idx) => (
              <RestaurantCard key={`${place.title}-${idx}`} place={place} index={idx} lang={lang} matchedEntry={history.find(h => h.review?.restaurantName?.toLowerCase().trim() === place.title.toLowerCase().trim())} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-1000">
            <div className="w-20 h-20 text-slate-100 dark:text-white/5 mb-8">
              {AppIcons.search('w-full h-full')}
            </div>
            <h3 className="text-sm font-black text-slate-300 dark:text-slate-800 tracking-[0.3em] uppercase">{t.noLogs}</h3>
            <p className="text-[10px] font-bold text-slate-200 mt-2 uppercase tracking-widest">Select a vibe to begin neural mapping</p>
          </div>
        )}
      </div>
    </div>
  );
};
