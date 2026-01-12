
export type CuisineType = 'Chinese' | 'Japanese' | 'Italian' | 'French' | 'Western' | 'StreetFood' | 'Cafe' | 'Other';
export type CraveType = 'comfort' | 'healthy' | 'spicy' | 'sweet' | 'social' | 'surprise';

export type PetType = 'dog' | 'cat' | 'mouse' | 'kangaroo' | 'koala' | 'custom';
export type PetAccessory = 'none' | 'hat' | 'scarf' | 'bowtie';
export type Language = 'zh' | 'en';
export type Theme = 'light' | 'dark';

export type MoodType = 'happy' | 'energetic' | 'calm' | 'neutral' | 'anxious' | 'sad';

export interface PetState {
  type: PetType;
  customDescription?: string;
  hp: number;
  level: number;
  name: string;
  accessory?: PetAccessory;
  imageUrl?: string;
  isSleeping?: boolean;
}

export interface RestaurantReview {
  restaurantName: string;
  rating: number;
  recommendedDishes: string[];
  avoidDishes: string[];
  userReview: string;
  wishlistDishes: string[];
  foodPhoto?: string; // Base64
}

export interface FoodEntry {
  id: string;
  date: string;
  cuisine: CuisineType;
  crave: CraveType;
  note?: string; 
  review?: RestaurantReview;
  insight?: FoodInsight;
  keywords?: string[];
}

export interface FoodInsight {
  chefAnalysis: string; 
  cookingTip: string; 
  petComment: string; 
  moodDetection?: string; 
  placesNearby?: GroundingPlace[];
  analysis?: string;
  keywords: string[];
  recipeIdea?: {
    title: string;
    difficulty: string;
    keyIngredients: string[];
  };
}

export interface DailyInsight {
  refinedEmotion: string;
  keywords: string[];
  implicitAnalysis: string;
  affirmation: string;
  news: string;
  musicSuggestion?: {
    title: string;
    artist: string;
  };
  placesNearby?: GroundingPlace[];
}

export interface PatternAnalysis {
  patternSummary: string;
  detectedKeywords: string[];
  advice: string;
}

export interface GroundingPlace {
  title: string;
  uri: string;
  googleRating?: number;
  personalRating?: number;
  isVisited?: boolean;
  personalKeywords?: string[];
  googleKeywords?: string[];
  reviewId?: string;
}

export interface ReportData {
  period: 'weekly' | 'monthly' | 'yearly';
  summary: string;
  cuisineDistribution: Record<string, number>;
  chefAdvice: string;
  dominantCuisine: CuisineType;
}
