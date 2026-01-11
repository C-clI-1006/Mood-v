
import { GoogleGenAI, Type } from "@google/genai";
import { MoodType, DailyInsight } from "../types";

export async function getMoodInsight(mood: MoodType, recentMoods: MoodType[]): Promise<DailyInsight> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key 未配置。请在部署环境变量中设置 API_KEY。");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一个温柔的心情陪伴助手。
      当前用户的心情是: "${mood}"。
      过去几天的历史心情趋势是: ${recentMoods.join(', ')}。
      
      请根据当前心情提供以下内容（必须使用简体中文）：
      1. 一句温暖的每日寄语（治愈且简短）。
      2. 一则真实的、令人感到温暖的正能量新闻或冷知识。
      3. 一个针对当前心情的音乐推荐。
      
      请严格按 JSON 格式输出。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            affirmation: { type: Type.STRING },
            news: { type: Type.STRING },
            musicSuggestion: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["title", "artist", "reason"]
            }
          },
          required: ["affirmation", "news", "musicSuggestion"]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("AI 响应内容为空");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    if (error.message?.includes('fetch') || error.message?.includes('Network')) {
      throw new Error("连接 AI 失败。由于你在中国，请确保已开启能够访问海外网络的环境。");
    }
    throw error;
  }
}
