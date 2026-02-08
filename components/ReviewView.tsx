
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CuisineType, Language, RestaurantReview, UnifiedInsight, FoodEntry } from '../types';
import { ChefEntryForm } from './ChefEntryForm';
import { InsightCard } from './InsightCard';
import { translations } from '../translations';

interface ReviewViewProps {
  lang: Language;
  isLoading: boolean;
  history: FoodEntry[];
  onSubmit: (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string, id?: string) => void;
  onDelete?: (id: string) => void;
  currentInsight: UnifiedInsight | null;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ lang, isLoading, history, onSubmit, onDelete, currentInsight }) => {
  const t = translations[lang];
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [prefilledName, setPrefilledName] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const prefillName = params.get('prefill_name');
    if (id && history.length > 0) {
      const target = history.find(h => h.id === id);
      if (target) {
        setEditingEntry(target); setPrefilledName(null); setView('edit');
        navigate('/review', { replace: true });
      }
    } else if (prefillName) {
      setEditingEntry(null); setPrefilledName(prefillName); setView('edit');
      navigate('/review', { replace: true });
    }
  }, [location.search, history, navigate]);

  const handleStartNew = () => { setEditingEntry(null); setPrefilledName(null); setView('edit'); };
  const handleEdit = (entry: FoodEntry) => { setEditingEntry(entry); setPrefilledName(null); setView('edit'); };
  const handleBack = () => { setView('list'); setEditingEntry(null); setPrefilledName(null); };

  const handleFormSubmit = (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string) => {
    onSubmit(cuisine, review, note, photo, editingEntry?.id);
    setView('list');
  };

  return (
    <div className="px-6 pt-10 pb-40 h-full flex flex-col no-scrollbar overflow-y-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-200 tracking-tighter leading-none">{t.reviewTitle}</h2>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] mt-2">{t.reviewDesc}</p>
        </div>
        {view === 'list' && <button onClick={handleStartNew} className="w-12 h-12 bg-indigo-600 text-indigo-50 rounded-full shadow-lg flex items-center justify-center text-xl active:scale-90 transition-all">+</button>}
        {view === 'edit' && <button onClick={handleBack} className="w-12 h-12 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-400 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest">Back</button>}
      </header>

      {view === 'list' ? (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <div className="text-6xl mb-6 grayscale opacity-20">📔</div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-800">{t.noLogs}</p>
            </div>
          ) : (
            history.slice().reverse().map((entry) => (
              <ArchiveCard key={entry.id} entry={entry} lang={lang} onClick={() => handleEdit(entry)} />
            ))
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ChefEntryForm onSubmit={handleFormSubmit} onDelete={editingEntry ? () => { onDelete?.(editingEntry.id); setView('list'); } : undefined} lang={lang} isLoading={isLoading} initialData={editingEntry} prefilledName={prefilledName} />
          {(currentInsight || editingEntry?.insight) && (
            <div className="mt-12">
              <InsightCard insight={currentInsight || editingEntry?.insight!} isLoading={isLoading} lang={lang} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ArchiveCard: React.FC<{ entry: FoodEntry, lang: Language, onClick: () => void }> = ({ entry, lang, onClick }) => {
  const date = new Date(entry.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  const t = translations[lang];
  return (
    <button onClick={onClick} className="w-full text-left glass-card p-5 rounded-[2.5rem] flex items-center gap-4 transition-all active:scale-95 shadow-lg border-l-8 border-l-indigo-600">
      <div className="w-16 h-16 rounded-2xl bg-slate-300 dark:bg-white/10 overflow-hidden flex-shrink-0">
        {entry.review?.foodPhoto ? <img src={entry.review.foodPhoto} className="w-full h-full object-cover" alt="food" /> : <div className="w-full h-full flex items-center justify-center text-xl grayscale opacity-30">🍽️</div>}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{date} • {t[entry.cuisine]}</span>
          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400">💎 {entry.review?.rating || 5}</span>
        </div>
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate leading-tight">{entry.review?.restaurantName || 'Untitled Spot'}</h4>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-1 italic">{entry.note || 'No notes saved...'}</p>
      </div>
    </button>
  );
};
