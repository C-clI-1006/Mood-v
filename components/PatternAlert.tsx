
import React from 'react';
import { PatternAnalysis, Language } from '../types';
import { translations } from '../translations';

interface PatternAlertProps {
  analysis: PatternAnalysis;
  onClose: () => void;
  lang: Language;
}

export const PatternAlert: React.FC<PatternAlertProps> = ({ analysis, onClose, lang }) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-[100] bg-darkblue/40 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-darkblue p-8 text-cream text-center relative">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-black uppercase tracking-tighter">
            {lang === 'zh' ? '模式警报' : 'Pattern Alert'}
          </h3>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.3em] mt-1">
             Recurring Emotions Detected
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black text-beigegray uppercase tracking-widest">{lang === 'zh' ? '观察到的模式' : 'Observed Pattern'}</span>
            <p className="text-sm font-bold text-darkblue dark:text-cream leading-relaxed">
              {analysis.patternSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.detectedKeywords.map((k, i) => (
              <span key={i} className="px-3 py-1 bg-beigegray/20 dark:bg-gray-700 text-[10px] font-black text-darkblue dark:text-beigegray rounded-full uppercase">
                #{k}
              </span>
            ))}
          </div>

          <div className="p-5 bg-rose-50 dark:bg-rose-900/20 rounded-3xl border border-rose-100 dark:border-rose-800">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{t.advice}</span>
             </div>
             <p className="text-[12px] font-medium text-rose-600 dark:text-rose-300 leading-relaxed italic">
               "{analysis.advice}"
             </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-darkblue text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            {lang === 'zh' ? '明白了，我会注意' : 'Got it, I’ll be mindful'}
          </button>
        </div>
      </div>
    </div>
  );
};
