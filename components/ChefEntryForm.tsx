
import React, { useState, useRef, useEffect } from 'react';
import { CuisineType, Language, RestaurantReview, GroundingPlace, FoodEntry } from '../types';
import { translations } from '../translations';
import { searchRestaurants } from '../services/geminiService';
import { AppIcons } from './Icons';

interface ChefEntryFormProps {
  onSubmit: (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string) => void;
  lang: Language;
  isLoading: boolean;
  onDelete?: () => void;
  initialData?: FoodEntry | null;
  prefilledName?: string | null;
}

const cuisines: { type: CuisineType; label: string }[] = [
  { type: 'Chinese', label: 'CN' },
  { type: 'Japanese', label: 'JP' },
  { type: 'Italian', label: 'IT' },
  { type: 'French', label: 'FR' },
  { type: 'Western', label: 'WS' },
  { type: 'StreetFood', label: 'ST' },
  { type: 'Cafe', label: 'CF' },
  { type: 'Other', label: 'OT' },
];

export const ChefEntryForm: React.FC<ChefEntryFormProps> = ({ onSubmit, lang, isLoading, onDelete, initialData, prefilledName }) => {
  const t = translations[lang];
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>(initialData?.cuisine || 'Chinese');
  const [restaurantName, setRestaurantName] = useState(initialData?.review?.restaurantName || prefilledName || '');
  const [rating, setRating] = useState(initialData?.review?.rating || 5);
  const [recommended, setRecommended] = useState(initialData?.review?.recommendedDishes?.join(', ') || '');
  const [avoid, setAvoid] = useState(initialData?.review?.avoidDishes?.join(', ') || '');
  const [wishlist, setWishlist] = useState(initialData?.review?.wishlistDishes?.join(', ') || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [photo, setPhoto] = useState<string | null>(initialData?.review?.foodPhoto || null);
  const [searchResults, setSearchResults] = useState<GroundingPlace[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefilledName && !initialData) setRestaurantName(prefilledName);
  }, [prefilledName, initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (restaurantName.length < 2) return;
    setIsLocating(true);
    setShowResults(true);
    try {
      const results = await searchRestaurants(restaurantName, lang);
      setSearchResults(results);
    } catch (e) { console.error(e); } finally { setIsLocating(false); }
  };

  const handleSelectPlace = (place: GroundingPlace) => {
    setRestaurantName(place.title);
    setShowResults(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const review: RestaurantReview = {
      restaurantName,
      rating,
      recommendedDishes: recommended.split(/[，, ]+/).filter(Boolean),
      avoidDishes: avoid.split(/[..., ]+/).filter(Boolean),
      userReview: note,
      wishlistDishes: wishlist.split(/[..., ]+/).filter(Boolean),
      foodPhoto: photo || undefined
    };
    onSubmit(selectedCuisine, review, note, photo || undefined);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 菜系矩阵 */}
      <section className="px-1">
        <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] mb-3 block">Category Matrix</span>
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {cuisines.map(c => (
            <button
              key={c.type}
              onClick={() => setSelectedCuisine(c.type)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl transition-all duration-500 border ${
                selectedCuisine === c.type ? 'bg-darkblue dark:bg-indigo-600 border-darkblue text-white shadow-xl' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'
              }`}
            >
              <span className="text-[9px] font-black tracking-widest uppercase">{t[c.type]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-8 bg-white dark:bg-midnight-card p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
        {/* 图片与名称检索 */}
        <div className="flex items-center gap-5 relative" ref={searchContainerRef}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 cursor-pointer overflow-hidden group transition-all"
          >
            {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="w-6 h-6 text-slate-300 group-hover:text-indigo-500 transition-colors">{AppIcons.sparkles()}</div>}
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase mb-1.5 block">{t.restaurantName}</span>
            <div className="flex gap-2">
              <input 
                placeholder={t.searchPlaceholder}
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                className="flex-1 bg-transparent border-b border-slate-100 dark:border-white/5 py-1.5 text-sm font-bold outline-none focus:border-indigo-500 transition-colors text-darkblue dark:text-white"
              />
              <button 
                onClick={handleSearch}
                disabled={isLocating || restaurantName.length < 2}
                className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center hover:bg-darkblue dark:hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30"
              >
                {isLocating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : AppIcons.search('w-4 h-4')}
              </button>
            </div>

            {showResults && (
              <div className="absolute left-0 right-0 top-full mt-5 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 max-h-64 overflow-y-auto animate-in slide-in-from-top-3">
                {searchResults.map((place, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left px-8 py-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between border-b border-slate-50 dark:border-white/5 last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-darkblue dark:text-white">{place.title}</span>
                      <span className="text-[8px] opacity-30 font-bold uppercase tracking-widest mt-0.5">Verified Coordinate</span>
                    </div>
                    {place.distance && <span className="text-[9px] font-black bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg text-slate-400">{place.distance}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
        </div>

        {/* 阶级评分 (Rating Core) */}
        <div className="py-4 border-y border-slate-50 dark:border-white/5">
           <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-5 block">Quality Evaluation</span>
           <div className="flex gap-5 justify-start">
             {[1, 2, 3, 4, 5].map(num => (
               <button 
                 key={num}
                 onClick={() => setRating(num)}
                 className={`w-8 h-8 transition-all duration-500 transform active:scale-75 ${rating >= num ? 'text-indigo-500 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-100 dark:text-white/5'}`}
               >
                 {AppIcons.diamond('w-full h-full')}
               </button>
             ))}
           </div>
        </div>

        {/* 数据字段 */}
        <div className="space-y-4">
          <input placeholder={t.recommended} value={recommended} onChange={e=>setRecommended(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500/20 text-darkblue dark:text-white" />
          <input placeholder={t.avoid} value={avoid} onChange={e=>setAvoid(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-500/20 text-darkblue dark:text-white" />
          <textarea placeholder={t.moodNotePlaceholder} value={note} onChange={e=>setNote(e.target.value)} className="w-full h-28 bg-slate-50 dark:bg-white/5 rounded-3xl p-5 text-xs font-bold outline-none border border-transparent focus:border-indigo-500/20 transition-all resize-none text-darkblue dark:text-white" />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          disabled={isLoading}
          onClick={handleSubmit}
          className="flex-1 py-5 bg-darkblue dark:bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all disabled:opacity-20"
        >
          {isLoading ? t.depthAnalysis : t.saveEntry}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all"
          >
            {AppIcons.plus('w-6 h-6 rotate-45')}
          </button>
        )}
      </div>
    </div>
  );
};
