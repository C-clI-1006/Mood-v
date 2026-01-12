
import React, { useState } from 'react';
import { CuisineType, Language, RestaurantReview, FoodInsight, PetState } from '../types';
import { ChefEntryForm } from './ChefEntryForm';
import { ChefInsightCard } from './ChefInsightCard';
import { translations } from '../translations';

interface ReviewViewProps {
  lang: Language;
  isLoading: boolean;
  onSubmit: (cuisine: CuisineType, review: RestaurantReview, note: string, photo?: string) => void;
  currentInsight: FoodInsight | null;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ lang, isLoading, onSubmit, currentInsight }) => {
  const t = translations[lang];

  return (
    <div className="px-8 pt-12 pb-32 animate-in fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-darkblue dark:text-cream tracking-tighter">{t.reviewTitle}</h2>
        <p className="text-[10px] font-bold text-beigegray uppercase tracking-[0.4em] mt-1">{t.reviewDesc}</p>
      </header>

      <ChefEntryForm onSubmit={onSubmit} lang={lang} isLoading={isLoading} />

      {currentInsight && (
        <div className="mt-12">
          <ChefInsightCard insight={currentInsight} isLoading={isLoading} lang={lang} />
          {currentInsight.moodDetection && (
            <div className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 text-center shadow-sm">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2">{t.moodInPhoto}</span>
              <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200 italic">“{currentInsight.moodDetection}”</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
