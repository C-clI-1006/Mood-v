
import { FoodEntry, PetState, PatternAnalysis } from "../types";
import { generatePatternAdvice } from "./geminiService";

const KEYS = {
  HISTORY: 'moodflow_history',
  PET: 'moodflow_pet',
  LANG: 'moodflow_lang',
  THEME: 'moodflow_theme',
  LAST_MOOD: 'moodflow_last_mood',
  LAST_OPENED: 'moodflow_last_opened'
};

export const storageService = {
  // Persistent Storage Interface
  saveHistory(history: FoodEntry[]) {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  getHistory(): FoodEntry[] {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  },

  savePet(pet: PetState) {
    localStorage.setItem(KEYS.PET, JSON.stringify(pet));
  },

  getPet(): PetState | null {
    const data = localStorage.getItem(KEYS.PET);
    return data ? JSON.parse(data) : null;
  },

  // Pattern Detection Engine
  async analyzePatterns(currentEntry: FoodEntry, history: FoodEntry[], lang: 'zh' | 'en'): Promise<PatternAnalysis | null> {
    // We only trigger deep pattern analysis if there's enough data density
    const relevantHistory = history.filter(h => h.crave === currentEntry.crave || h.mood === currentEntry.mood);
    
    if (relevantHistory.length >= 2) {
      const patternBatch = [...relevantHistory.slice(-2), currentEntry];
      return await generatePatternAdvice(patternBatch, lang);
    }
    return null;
  }
};
