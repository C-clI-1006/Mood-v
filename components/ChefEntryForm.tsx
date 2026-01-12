
import React, { useState, useRef } from 'react';
import { CuisineType, Language, RestaurantReview } from '../types';
import { translations } from '../translations';
import { getDiscoveryRecommendations } from '../services/geminiService';

interface ChefEntryFormProps {
  onSubmit: (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string) => void;
  lang: Language;
  isLoading: boolean;
}

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

export const ChefEntryForm: React.FC<ChefEntryFormProps> = ({ onSubmit, lang, isLoading }) => {
  const t = translations[lang];
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('Chinese');
  const [restaurantName, setRestaurantName] = useState('');
  const [rating, setRating] = useState(5);
  const [recommended, setRecommended] = useState('');
  const [avoid, setAvoid] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocate = async () => {
    if (!restaurantName) return;
    setIsLocating(true);
    try {
      const results = await getDiscoveryRecommendations(lang, selectedCuisine, 'surprise');
      const match = results.find(r => r.title.toLowerCase().includes(restaurantName.toLowerCase()));
      if (match) {
        setRestaurantName(match.title);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocating(false);
    }
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
    setRestaurantName(''); setRating(5); setRecommended(''); setAvoid(''); setWishlist(''); setNote(''); setPhoto(null);
  };

  return (
    <div className="space-y-6">
      {/* 菜系选择 */}
      <section>
        <span className="text-[10px] font-black text-beigegray uppercase tracking-[0.4em] ml-2 mb-2 block">{t.Chinese} / {t.Japanese} ...</span>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {cuisines.map(c => (
            <button
              key={c.type}
              onClick={() => setSelectedCuisine(c.type)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
                selectedCuisine === c.type ? 'bg-darkblue text-cream shadow-lg' : 'bg-white dark:bg-gray-800 text-beigegray'
              }`}
            >
              <span className="text-sm">{c.icon}</span>
              <span className="text-[9px] font-black uppercase">{t[c.type]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-6 bg-white dark:bg-gray-800/40 p-6 rounded-[2.5rem] border border-beigegray/30 shadow-sm">
        {/* 图片与名称 */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-2xl bg-beigegray/20 flex items-center justify-center border-2 border-dashed border-beigegray cursor-pointer overflow-hidden group active:scale-95 transition-all"
          >
            {photo ? <img src={photo} className="w-full h-full object-cover" /> : <span className="text-xl group-hover:scale-110 transition-transform">📷</span>}
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black text-beigegray uppercase mb-1 block">{t.restaurantName}</span>
            <div className="flex gap-2">
              <input 
                placeholder="..."
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                className="flex-1 bg-transparent border-b border-beigegray/50 py-1 text-sm font-bold outline-none focus:border-darkblue"
              />
              <button 
                onClick={handleLocate}
                disabled={isLocating || !restaurantName}
                className="p-2 bg-beigegray/20 rounded-xl text-xs hover:bg-darkblue hover:text-white transition-all disabled:opacity-20"
              >
                {isLocating ? '...' : '📍'}
              </button>
            </div>
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
        </div>

        {/* 评分系统 */}
        <div className="px-1 py-2 border-y border-beigegray/10">
           <span className="text-[9px] font-black text-beigegray uppercase tracking-widest mb-3 block">{t.giveRating}</span>
           <div className="flex gap-4 justify-start">
             {[1, 2, 3, 4, 5].map(num => (
               <button 
                 key={num}
                 onClick={() => setRating(num)}
                 className={`text-2xl transition-all transform active:scale-75 ${rating >= num ? 'grayscale-0 scale-110' : 'grayscale opacity-20 scale-90'}`}
               >
                 💎
               </button>
             ))}
           </div>
        </div>

        {/* 文本区域 */}
        <div className="space-y-3">
          <input placeholder={t.recommended} value={recommended} onChange={e=>setRecommended(e.target.value)} className="w-full bg-beigegray/10 rounded-xl p-3 text-xs outline-none focus:bg-emerald-50" />
          <input placeholder={t.avoid} value={avoid} onChange={e=>setAvoid(e.target.value)} className="w-full bg-beigegray/10 rounded-xl p-3 text-xs outline-none focus:bg-rose-50" />
          <textarea placeholder={t.moodNotePlaceholder} value={note} onChange={e=>setNote(e.target.value)} className="w-full h-24 bg-beigegray/10 rounded-2xl p-4 text-xs outline-none focus:bg-white transition-all resize-none" />
        </div>
      </div>

      <button
        disabled={isLoading}
        onClick={handleSubmit}
        className="w-full py-5 bg-darkblue text-cream rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-30"
      >
        {isLoading ? t.depthAnalysis : t.saveEntry}
      </button>
    </div>
  );
};
