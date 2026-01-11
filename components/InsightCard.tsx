
import React from 'react';
import { DailyInsight } from '../types';

interface InsightCardProps {
  insight: DailyInsight;
  isLoading: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 m-4 bg-white rounded-3xl shadow-sm animate-pulse">
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
        <div className="h-32 bg-gray-50 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 m-4">
      {/* Daily Affirmation */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
        <h3 className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">每日寄语</h3>
        <p className="text-xl font-medium leading-relaxed">“{insight.affirmation}”</p>
      </div>

      {/* Good News */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-3">
          <span className="p-2 bg-green-100 rounded-full mr-3">✨</span>
          <h3 className="text-gray-800 font-bold">值得开心的事</h3>
        </div>
        <p className="text-gray-600 leading-relaxed italic">{insight.news}</p>
      </div>

      {/* Music Suggestion */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        <div className="flex items-center mb-4">
          <span className="p-2 bg-pink-100 rounded-full mr-3">🎵</span>
          <h3 className="text-gray-800 font-bold">为你推荐的音乐</h3>
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-gray-900">{insight.musicSuggestion.title}</h4>
          <p className="text-pink-600 font-medium mb-3">{insight.musicSuggestion.artist}</p>
          <p className="text-gray-500 text-sm mb-4">{insight.musicSuggestion.reason}</p>
          
          <button 
            onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(insight.musicSuggestion.title + ' ' + insight.musicSuggestion.artist)}`, '_blank')}
            className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            在 Spotify 播放
          </button>
        </div>
      </div>
    </div>
  );
};
