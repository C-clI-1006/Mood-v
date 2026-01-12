
import React, { useState } from 'react';
import { CraveType, CuisineType, Language, GroundingPlace, FoodEntry } from '../types';
import { FoodSelector } from './FoodSelector';
import { getDiscoveryRecommendations } from '../services/geminiService';
import { translations } from '../translations';
import { useNavigate } from 'react-router-dom';

const cuisines: { type: CuisineType; icon: string }[] = [
  { type: 'Chinese', icon: '🥟' },
  { type: 'Japanese', icon: '🍣' },
  { type: 'Italian', icon: '🍝' },
  { type: 'French', icon: '🥐' },
  { type: 'Western', icon: '🥩' },
  { type: 'StreetFood', icon: '🍢' },
  { type: 'Cafe', icon: '☕' },
  { type: 'Other', icon: '🗺️' },
];

export const DiscoveryView: React.FC<{ lang: Language; history: FoodEntry[] }> = ({ lang, history }) => {
  const [selectedCrave, setSelectedCrave] = useState<CraveType | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | null>(null);
  const [places, setPlaces] = useState<GroundingPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const t = translations[lang];
  const navigate = useNavigate();

  const handleSearch = async (crave: CraveType) => {
    setSelectedCrave(crave);
    setIsSearching(true);
    try {
      const results = await getDiscoveryRecommendations(lang, selectedCuisine || undefined, crave);
      
      // Enhance results with personal history
      const enhancedResults = results.map(place => {
        const match = history.find(h => 
          h.review?.restaurantName.toLowerCase().includes(place.title.toLowerCase()) ||
          place.title.toLowerCase().includes(h.review?.restaurantName.toLowerCase() || "")
        );

        if (match) {
          return {
            ...place,
            isVisited: true,
            personalRating: match.review?.rating || 5,
            personalKeywords: match.insight?.keywords || [],
            reviewId: match.id,
          };
        }
        return {
          ...place,
          isVisited: false,
        };
      });

      setPlaces(enhancedResults);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="px-8 pt-12 pb-32 animate-in fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-darkblue dark:text-cream tracking-tighter">{t.discoveryTitle}</h2>
        <p className="text-[10px] font-bold text-beigegray uppercase tracking-[0.4em] mt-1">{t.discoveryDesc}</p>
      </header>

      {/* Selectors Area */}
      <div className="space-y-6 mb-8">
        {/* Cuisine Selector */}
        <section>
          <span className="text-[10px] font-black text-beigegray uppercase tracking-[0.4em] ml-2 mb-2 block">{lang === 'zh' ? '预选菜系 (可选)' : 'Cuisine (Optional)'}</span>
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-2">
            {cuisines.map(c => (
              <button
                key={c.type}
                onClick={() => setSelectedCuisine(selectedCuisine === c.type ? null : c.type)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  selectedCuisine === c.type ? 'bg-darkblue border-darkblue text-cream' : 'bg-white dark:bg-gray-800 border-beigegray/30 text-beigegray'
                }`}
              >
                <span className="text-sm">{c.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-widest">{t[c.type]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Crave Selector (Triggers search) */}
        <section className="bg-white dark:bg-gray-800/40 p-4 rounded-[3rem] border border-beigegray/30">
          <span className="text-[10px] font-black text-beigegray uppercase tracking-[0.4em] ml-2 mb-2 block">{t.recordMood}</span>
          <FoodSelector onSelect={handleSearch} selectedCrave={selectedCrave} lang={lang} />
        </section>
      </div>

      {isSearching && (
        <div className="flex flex-col items-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-darkblue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-beigegray">主厨正在寻觅灵感...</p>
        </div>
      )}

      {!isSearching && places.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <span className="text-[10px] font-black text-darkblue dark:text-cream uppercase tracking-[0.4em] ml-2">{t.seePlaces}</span>
          <div className="grid gap-4">
            {places.map((p, i) => (
              <div key={i} className="flex flex-col p-6 bg-cream dark:bg-gray-800 rounded-[2.5rem] border border-beigegray/30 shadow-sm transition-all relative overflow-hidden">
                {/* Visited Badge */}
                {p.isVisited && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full animate-in zoom-in">
                    {t.visited}
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-base font-black text-darkblue dark:text-white leading-tight pr-12 block">{p.title}</span>
                  
                  {/* Ratings Area */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 border-t border-beigegray/20 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-amber-500 uppercase mb-0.5">{t.googleRating}</span>
                      <span className="text-sm font-black text-darkblue dark:text-cream">⭐ {p.googleRating}</span>
                    </div>
                    {p.isVisited && (
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-indigo-500 uppercase mb-0.5">{t.personalRating}</span>
                        <span className="text-sm font-black text-darkblue dark:text-cream">💎 {p.personalRating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Keyword Comparison */}
                <div className="space-y-3 mb-5">
                  {/* Google Keywords */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-beigegray uppercase tracking-widest ml-1">{lang === 'zh' ? '大家都在说' : 'Google Buzz'}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.googleKeywords?.map((kw, idx) => (
                        <span key={idx} className="text-[7px] font-black text-darkblue/60 uppercase bg-white dark:bg-gray-700 px-2 py-0.5 rounded-lg border border-beigegray/30">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Personal Keywords if visited */}
                  {p.isVisited && p.personalKeywords && p.personalKeywords.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest ml-1">{lang === 'zh' ? '我的独家印记' : 'My Keywords'}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.personalKeywords.slice(0, 3).map((kw, idx) => (
                          <span key={idx} className="text-[7px] font-black text-white uppercase bg-emerald-500 px-2 py-0.5 rounded-lg">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <a 
                    href={p.uri} 
                    target="_blank" 
                    className="flex-1 py-3 bg-white dark:bg-gray-700 text-darkblue dark:text-white rounded-2xl border border-beigegray/30 text-[9px] font-black uppercase tracking-widest text-center active:scale-95 transition-all shadow-sm"
                  >
                    📍 GOOGLE MAPS
                  </a>
                  {p.reviewId && (
                    <button 
                      onClick={() => navigate(`/stats`)} 
                      className="flex-1 py-3 bg-darkblue text-cream rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      📔 {t.viewReview}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
