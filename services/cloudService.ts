
import { FoodEntry, PatternAnalysis } from "../types";
import { generatePatternAdvice } from "./geminiService";

/**
 * 模拟云端存储服务
 */
export const cloudService = {
  // 模拟同步到云端
  async syncToCloud(entry: FoodEntry): Promise<void> {
    console.log("Cloud Sync: Uploading diary entry...", entry.id);
    return new Promise(resolve => setTimeout(resolve, 800)); // 模拟网络延迟
  },

  // 检测相似模式
  async detectRecurringPattern(currentEntry: FoodEntry, history: FoodEntry[], lang: 'zh' | 'en'): Promise<PatternAnalysis | null> {
    if (history.length < 2) return null;

    // 筛选相同渴望的记录 (Corrected: use crave instead of missing mood property)
    const sameMoodHistory = history.filter(h => h.crave === currentEntry.crave);
    if (sameMoodHistory.length < 2) return null;

    // 简易相似度计算：计算关键词重叠度
    const currentKeywords = new Set(currentEntry.keywords || []);
    
    const similarEntries = sameMoodHistory.filter(h => {
      const hKeywords = h.keywords || [];
      const intersection = hKeywords.filter(k => currentKeywords.has(k));
      // 如果有 2 个以上的关键词重复，认为语义相似
      return intersection.length >= 2;
    });

    // 如果加上当前这条，相似条目达到 3 条（历史 2 条 + 当前 1 条）
    if (similarEntries.length >= 2) {
      console.log("Pattern Detected: Generating advice for recurring mood...");
      const patternBatch = [...similarEntries, currentEntry];
      return await generatePatternAdvice(patternBatch, lang);
    }

    return null;
  }
};
