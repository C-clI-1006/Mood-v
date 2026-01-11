
export type MoodType = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'energetic';

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  note?: string;
  insight?: DailyInsight;
}

export interface DailyInsight {
  affirmation: string;
  news: string;
  musicSuggestion: {
    title: string;
    artist: string;
    reason: string;
    spotifyUrl?: string;
  };
}

export interface AppState {
  history: MoodEntry[];
  lastEntryDate: string | null;
}
