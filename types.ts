
export type CuisineType = 'Chinese' | 'Japanese' | 'Italian' | 'French' | 'Western' | 'StreetFood' | 'Cafe' | 'Other';
export type CraveType = 'comfort' | 'healthy' | 'spicy' | 'sweet' | 'social' | 'surprise';

export type PetType = 'dog' | 'cat' | 'mouse' | 'kangaroo' | 'koala' | 'custom';
export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';
export type MoodType = 'happy' | 'energetic' | 'calm' | 'neutral' | 'anxious' | 'sad';

export interface PetState {
  type: PetType;
  customDescription?: string;
  hp: number;
  level: number;
  name: string;
  imageUrl?: string;
}

export interface RestaurantReview {
  restaurantName: string;
  rating: number;
  recommendedDishes: string[];
  avoidDishes: string[];
  userReview: string;
  wishlistDishes: string[];
  foodPhoto?: string;
}

export interface UnifiedInsight {
  type: 'daily' | 'food';
  title?: string;
  analysis: string; 
  keywords: string[];
  affirmation?: string; 
  news?: string; 
  tip?: string; 
  music?: {
    title: string;
    artist: string;
  };
  recipe?: {
    title: string;
    difficulty: string;
    keyIngredients: string[];
  };
  places?: GroundingPlace[];
  refinedEmotion?: string; 
  petComment: string; 
}

export interface FoodEntry {
  id: string;
  date: string;
  cuisine: CuisineType;
  crave: CraveType;
  mood?: MoodType;
  note?: string; 
  review?: RestaurantReview;
  insight?: UnifiedInsight;
  keywords?: string[];
}

export interface DailyInsight extends UnifiedInsight {
  type: 'daily';
}

export interface PatternAnalysis {
  patternSummary: string;
  detectedKeywords: string[];
  advice: string;
}

export interface GroundingPlace {
  title: string;
  uri: string;
  distance?: string;
  googleRating?: number;
  address?: string;
  photoUrl?: string;
  keywords?: string[];
  matchReason?: string;
  vibeScore?: number;
}

export interface ReportData {
  period: 'weekly' | 'monthly' | 'yearly';
  summary: string;
  cuisineDistribution: Record<string, number>;
  chefAdvice: string;
  dominantCuisine: CuisineType;
  emotionalInsight?: string;
  moodTrend: { date: string, value: number, mood: MoodType }[];
}
