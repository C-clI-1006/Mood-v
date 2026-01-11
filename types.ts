
export type MoodType = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'energetic';

export type PetType = 'dog' | 'cat' | 'mouse' | 'kangaroo' | 'koala' | 'custom';

export type PetAccessory = 'none' | 'hat' | 'scarf' | 'bowtie';

export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';

export interface PetState {
  type: PetType;
  customDescription?: string;
  hp: number;
  level: number;
  name: string;
  accessory?: PetAccessory;
  imageUrl?: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  note?: string; 
  imageAnalysis?: string;
  insight?: DailyInsight;
}

export interface DailyInsight {
  affirmation: string;
  news: string;
  petMessage: string;
  implicitAnalysis: string;
  placesNearby?: GroundingPlace[];
  musicSuggestion: {
    title: string;
    artist: string;
    reason: string;
    spotifyUrl?: string;
  };
}

export interface GroundingPlace {
  title: string;
  uri: string;
}

export interface ReportData {
  period: 'weekly' | 'monthly' | 'yearly';
  summary: string;
  trendAnalysis: string;
  dominantMood: MoodType;
  advice: string;
}
