
import React, { useState } from 'react';
import { PetType, Language } from '../types';
import { PetAvatar } from './PetAvatar';
import { translations } from '../translations';

interface PetSelectorProps {
  onSelect: (type: PetType, customDesc?: string) => void;
  isLoading?: boolean;
  lang: Language;
}

const getPetList = (lang: Language) => {
  const t = translations[lang];
  return [
    { type: 'dog' as PetType, label: t.pet_dog_label, desc: t.pet_dog_desc, mood: t.pet_dog_mood, bg: 'bg-beigegray/20' },
    { type: 'cat' as PetType, label: t.pet_cat_label, desc: t.pet_cat_desc, mood: t.pet_cat_mood, bg: 'bg-beigegray/30' },
    { type: 'mouse' as PetType, label: t.pet_mouse_label, desc: t.pet_mouse_desc, mood: t.pet_mouse_mood, bg: 'bg-beigegray/20' },
    { type: 'kangaroo' as PetType, label: t.pet_kangaroo_label, desc: t.pet_kangaroo_desc, mood: t.pet_kangaroo_mood, bg: 'bg-beigegray/30' },
    { type: 'koala' as PetType, label: t.pet_koala_label, desc: t.pet_koala_desc, mood: t.pet_koala_mood, bg: 'bg-beigegray/20' },
  ];
};

export const PetSelector: React.FC<PetSelectorProps> = ({ onSelect, isLoading, lang }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customDesc, setCustomDesc] = useState("");
  const [previewType, setPreviewType] = useState<PetType | null>(null);
  const t = translations[lang];
  const petList = getPetList(lang);

  if (isLoading && previewType) {
    return (
      <div className="fixed inset-0 z-[100] bg-darkblue flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
        <div className="relative mb-12">
           <div className="w-32 h-32 border-4 border-cream/20 border-t-cream rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
        </div>
        <h2 className="text-cream text-2xl font-black uppercase tracking-tighter mb-4">{t.summoningTitle}</h2>
        <p className="text-cream/40 text-sm mb-12">{t.summoningSub}</p>
        
        <div className="px-6 py-2 bg-cream/10 rounded-full text-[10px] font-black text-cream uppercase tracking-widest">
           Awakening Ritual
        </div>
      </div>
    );
  }

  if (showCustom) {
    return (
      <div className="fixed inset-0 z-50 bg-cream p-8 flex flex-col items-center justify-center animate-in slide-in-from-bottom-10">
        <div className="absolute top-12 left-8">
           <button onClick={() => setShowCustom(false)} className="text-deepblue text-2xl">✕</button>
        </div>
        <div className="text-5xl mb-6">🪄</div>
        <h2 className="text-3xl font-black mb-4 text-deepblue tracking-tighter text-center">{t.createYourOwn}</h2>
        <p className="text-beigegray text-center mb-8 text-sm px-4">{t.createYourOwnDesc}</p>
        <textarea
          value={customDesc}
          onChange={(e) => setCustomDesc(e.target.value)}
          placeholder={t.customPlaceholder}
          className="w-full p-6 rounded-[2.5rem] bg-beigegray/20 border-2 border-beigegray/30 h-40 mb-8 outline-none focus:border-darkblue focus:ring-4 focus:ring-darkblue/5 transition-all font-medium text-sm text-deepblue shadow-inner"
        />
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => {
              setPreviewType('custom');
              onSelect('custom', customDesc);
            }}
            disabled={!customDesc || isLoading}
            className="w-full py-5 bg-darkblue text-cream rounded-full font-black uppercase tracking-widest shadow-2xl disabled:opacity-50 hover:bg-black active:scale-95 transition-all"
          >
            {isLoading ? t.creatingBtn : t.createBtn}
          </button>
          <button 
            onClick={() => setShowCustom(false)} 
            className="py-4 text-beigegray font-black text-[10px] uppercase tracking-widest hover:text-darkblue transition-colors"
          >
            {t.backToList}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col items-center justify-start overflow-y-auto pt-16 pb-20 animate-in fade-in duration-1000">
      <div className="text-center mb-8 px-8">
        <h2 className="text-4xl font-black mb-4 tracking-tighter text-deepblue leading-tight uppercase">{t.petSelectorTitle}</h2>
        <p className="text-beigegray text-sm font-medium max-w-xs mx-auto">{t.petSelectorSub}</p>
      </div>

      <div className="w-full px-6 mb-6">
        <button 
          onClick={() => setShowCustom(true)}
          className="w-full p-8 bg-darkblue rounded-[3rem] text-cream flex flex-col items-center shadow-xl hover:bg-black active:scale-95 transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:rotate-12 transition-transform">✨</div>
          <span className="font-black text-lg">{t.customGuardianTitle}</span>
          <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">{t.customGuardianSubtitle}</span>
        </button>
      </div>
      
      <div className="w-full space-y-6 px-6 pb-12">
        {petList.map(p => (
          <button
            key={p.type}
            onClick={() => {
              setPreviewType(p.type);
              onSelect(p.type);
            }}
            className={`w-full group relative flex flex-col items-center ${p.bg} p-10 rounded-[4.5rem] shadow-sm border-4 border-white hover:border-beigegray transition-all duration-500 active:scale-95`}
          >
            <div className="absolute top-8 left-10">
               <span className="px-3 py-1 bg-cream/80 rounded-full text-[10px] font-black text-deepblue uppercase tracking-widest">{p.mood}</span>
            </div>
            
            <div className="my-8 transform transition-transform duration-700 group-hover:scale-110">
              <PetAvatar type={p.type} level={1} />
            </div>

            <div className="text-center">
              <span className="block text-2xl font-black text-deepblue mb-2">{p.label}</span>
              <span className="block text-xs text-beigegray font-medium leading-relaxed px-4">{p.desc}</span>
            </div>

            <div className="mt-8 px-10 py-4 bg-darkblue text-cream rounded-[2rem] shadow-2xl group-hover:bg-black transition-all duration-300">
               <span className="text-xs font-black uppercase tracking-[0.2em]">{t.adoptBtn}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
