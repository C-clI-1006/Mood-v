
import React, { useState } from 'react';
import { Language, Theme, PetState } from '../types';
import { translations } from '../translations';

interface SettingsViewProps {
  lang: Language;
  theme: Theme;
  pet: PetState | null;
  isUpdatingPet: boolean;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onResetData: () => void;
  onUpdateKey: () => void;
  onUpdatePetProfile: (name: string, description: string) => void;
  onRegenerateImage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  lang, theme, pet, isUpdatingPet, onToggleLang, onToggleTheme, onResetData, onUpdateKey, onUpdatePetProfile, onRegenerateImage 
}) => {
  const t = translations[lang];
  const [editingName, setEditingName] = useState(pet?.name || '');
  const [editingDesc, setEditingDesc] = useState(pet?.customDescription || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = () => {
    onUpdatePetProfile(editingName, editingDesc);
  };

  return (
    <div className="px-8 pt-12 pb-32 animate-in fade-in slide-in-from-right-8 duration-500">
      <header className="mb-12">
        <h2 className="text-3xl font-black text-darkblue dark:text-cream tracking-tighter">
          {t.settings}
        </h2>
        <p className="text-[10px] font-bold text-beigegray uppercase tracking-[0.4em] mt-1">System & Guardian</p>
      </header>

      <div className="space-y-10">
        {/* Pet Profile Section */}
        {pet && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-beigegray uppercase tracking-[0.3em] px-1">{t.petProfile}</h3>
            <div className="bg-beigegray/20 dark:bg-gray-800/40 p-6 rounded-[2.5rem] border border-beigegray/30 dark:border-gray-700/50">
               <div className="flex items-start gap-4 mb-6">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-3xl overflow-hidden bg-white dark:bg-gray-700 shadow-inner">
                      <img src={pet.imageUrl} className={`w-full h-full object-cover transition-all ${isUpdatingPet ? 'opacity-30 blur-sm' : ''}`} alt="pet" />
                    </div>
                    {isUpdatingPet && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-darkblue border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                     <span className="text-[9px] font-black text-beigegray uppercase mb-1 block">{t.petName}</span>
                     <input 
                        type="text" 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-transparent border-b-2 border-darkblue/10 dark:border-cream/10 text-lg font-bold outline-none focus:border-darkblue dark:focus:border-cream transition-colors w-full pb-1 mb-4"
                      />
                      
                      <span className="text-[9px] font-black text-beigegray uppercase mb-1 block">{t.petDesc}</span>
                      <textarea 
                        value={editingDesc} 
                        onChange={(e) => setEditingDesc(e.target.value)}
                        placeholder={pet.type === 'custom' ? t.customPlaceholder : 'Standard Avatar'}
                        className="bg-beigegray/10 dark:bg-gray-900/40 border border-beigegray/30 dark:border-gray-700 rounded-xl p-3 text-xs font-medium outline-none focus:border-darkblue w-full h-20 resize-none transition-all"
                      />
                  </div>
               </div>
               
               <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleSaveProfile}
                   disabled={isUpdatingPet}
                   className="w-full py-3 bg-darkblue text-cream rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
                 >
                   {t.save}
                 </button>
                 <button 
                   onClick={onRegenerateImage}
                   disabled={isUpdatingPet}
                   className="w-full py-3 bg-cream dark:bg-gray-700 text-darkblue dark:text-cream border border-beigegray/30 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   <span>✨</span> {t.regenerateImage}
                 </button>
               </div>
            </div>
          </section>
        )}

        {/* Appearance Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-beigegray uppercase tracking-[0.3em] px-1">{t.appearance}</h3>
          <div className="bg-beigegray/20 dark:bg-gray-800/40 rounded-[2.5rem] border border-beigegray/30 dark:border-gray-700/50 overflow-hidden">
            <button onClick={onToggleLang} className="w-full px-8 py-6 flex items-center justify-between border-b border-beigegray/20 dark:border-gray-700/50 active:bg-beigegray/10 transition-colors">
               <span className="text-sm font-bold text-darkblue dark:text-cream">{t.language}</span>
               <span className="text-[10px] font-black text-beigegray uppercase tracking-widest">{lang === 'zh' ? '简体中文' : 'English'}</span>
            </button>
            <button onClick={onToggleTheme} className="w-full px-8 py-6 flex items-center justify-between active:bg-beigegray/10 transition-colors">
               <span className="text-sm font-bold text-darkblue dark:text-cream">{t.theme}</span>
               <span className="text-lg">{theme === 'light' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </section>

        {/* AI & Key Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-beigegray uppercase tracking-[0.3em] px-1">Gemini AI</h3>
          <div className="bg-beigegray/20 dark:bg-gray-800/40 p-8 rounded-[2.5rem] border border-beigegray/30 dark:border-gray-700/50 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-xl shadow-sm mb-4">🔑</div>
             <span className="text-[9px] font-black text-beigegray uppercase tracking-widest mb-1">{t.apiKey}</span>
             <p className="text-[10px] font-medium text-darkblue dark:text-cream opacity-60 mb-6 truncate max-w-[200px]">••••••••••••••••••••</p>
             <button 
               onClick={onUpdateKey}
               className="px-6 py-2.5 bg-cream dark:bg-gray-700 text-darkblue dark:text-cream border border-beigegray/30 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95"
             >
               {t.updateKey}
             </button>
          </div>
        </section>

        {/* Data & About */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] px-1">{t.dangerZone}</h3>
          <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30">
            {showResetConfirm ? (
              <div className="p-4 text-center animate-in zoom-in-95">
                <p className="text-xs font-bold text-rose-500 mb-6 leading-relaxed">{t.confirmReset}</p>
                <div className="flex gap-3">
                   <button onClick={onResetData} className="flex-1 py-3 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                     {t.confirmReset.split('？')[0]}
                   </button>
                   <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 bg-white dark:bg-gray-800 text-beigegray rounded-full text-[10px] font-black uppercase tracking-widest">
                     {t.back}
                   </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-full px-8 py-5 flex items-center justify-between text-rose-500 font-bold text-sm active:bg-rose-100/50 transition-colors rounded-[2rem]"
              >
                <span>{t.clearData}</span>
                <span className="text-lg">🗑️</span>
              </button>
            )}
          </div>
        </section>

        {/* Footnote */}
        <footer className="text-center pt-8 pb-12 opacity-30">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-beigegray">
             G'dayMood v4.3.0 • AI Soul System
           </p>
        </footer>
      </div>
    </div>
  );
};
