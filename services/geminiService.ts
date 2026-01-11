
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MoodType, DailyInsight, PetType, PetAccessory, ReportData, MoodEntry, Language, GroundingPlace } from "../types";

// Base decoding/encoding for Live API
export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

/**
 * 辅助函数：深度清理并解析 JSON，处理常见的截断、尾随逗号和 Markdown 包裹问题。
 */
function safeJsonParse(text: string) {
  if (!text) return {};
  let cleaned = text.trim();
  
  // 移除 Markdown 标记
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  
  // 尝试提取最外层的大括号内容，以应对 AI 可能附带的解释性文字
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 处理可能的尾随逗号（简单的正则替换，虽然不完全严谨但对常见错误有效）
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Critical JSON Parse Error. Original text:", text);
    // 回退逻辑：如果解析彻底失败，返回一个包含基本信息的对象
    return {
      affirmation: "愿你的心情如阳光般灿烂。",
      news: "今天是个充满可能性的好日子。",
      petMessage: "汪/喵/吱！我一直在你身边哦。",
      implicitAnalysis: "正在感应你的心跳...",
      musicSuggestion: { title: "Peaceful Mind", artist: "MoodFlow", reason: "舒缓你的心灵" }
    };
  }
}

/**
 * Generates mood-based insights, affirmations, and music suggestions.
 * Uses thinkingBudget to ensure logical consistency and format compliance.
 */
export async function getMoodInsight(mood: MoodType, petType: PetType, note: string = "", lang: Language = 'zh', imageBase64?: string): Promise<DailyInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'zh' ? "必须使用简体中文输出" : "Must output in English";
  
  const petPersonalityPrompt = lang === 'zh' 
    ? `作为一只${petType}守护者，请在'petMessage'中加入物种标志性叫声并提供安慰。`
    : `As a ${petType} guardian, include your signature sounds in 'petMessage' and comfort the user.`;

  const useMaps = mood === 'anxious' || mood === 'sad';
  const tools: any[] = useMaps ? [{ googleMaps: {} }] : [];
  let latLng = undefined;

  if (useMaps) {
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) { console.error("Geo failed", e); }
  }

  const systemPrompt = `You are a healing pet companion. Personality Type: ${petType}. User mood: ${mood}. Note: "${note}". ${langPrompt}. 
  ${petPersonalityPrompt}
  Strictly return a single JSON object. DO NOT include trailing commas.
  Schema: { "affirmation": string, "news": string, "petMessage": string, "implicitAnalysis": string, "musicSuggestion": { "title": string, "artist": string, "reason": string } }.`;

  const promptParts: any[] = [{ text: systemPrompt }];
  if (imageBase64) {
    promptParts.push({ 
      inlineData: { 
        data: imageBase64.split(',')[1], 
        mimeType: 'image/jpeg' 
      } 
    });
  }

  const modelName = useMaps ? "gemini-2.5-flash" : "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: promptParts },
      config: {
        tools: tools,
        toolConfig: latLng ? { retrievalConfig: { latLng } } : undefined,
        responseMimeType: useMaps ? undefined : "application/json",
        // 增加思维预算以减少格式错误
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const result = safeJsonParse(response.text || "{}");

    const places: GroundingPlace[] = [];
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
      if (chunk.maps) {
        places.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      }
    });
    
    return { ...result, placesNearby: places.length > 0 ? places : undefined };
  } catch (error: any) {
    if (error.message?.includes("403") || error.message?.includes("permission")) {
      throw new Error("API_PERMISSION_DENIED");
    }
    throw error;
  }
}

export async function generatePetImage(type: PetType, accessory: PetAccessory = 'none', customDescription?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = customDescription || `A professional high-fidelity 3D character render of a cute ${type} pet companion, Pixar style, wearing a ${accessory === 'none' ? 'magical glowing aura' : accessory}. Soft cinematic lighting, vibrant pastel colors, clean white background, masterpiece quality.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image generation failed.");
  } catch (error: any) {
    if (error.message?.includes("403") || error.message?.includes("permission")) {
      throw new Error("API_PERMISSION_DENIED");
    }
    throw error;
  }
}

export async function generateReport(history: MoodEntry[], period: 'weekly' | 'monthly' | 'yearly', lang: Language): Promise<ReportData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'zh' ? "必须使用简体中文输出" : "Must output in English";
  const historyStr = history.map(e => `[${e.date}] Mood: ${e.mood}${e.note ? `, Note: ${e.note}` : ""}`).join("\n");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{
          text: `Analyze the following mood history for a ${period} report. ${langPrompt}.
          History:
          ${historyStr}
          Strictly JSON. No trailing commas.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    
    return safeJsonParse(response.text || "{}");
  } catch (error: any) {
    if (error.message?.includes("403") || error.message?.includes("permission")) {
      throw new Error("API_PERMISSION_DENIED");
    }
    throw error;
  }
}
