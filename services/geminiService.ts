
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MoodType, DailyInsight, PetType, PetAccessory, ReportData, MoodEntry, Language, GroundingPlace } from "../types";

// Helper to decode base64 strings to Uint8Array
export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

// Helper to encode Uint8Array to base64 strings
export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Helper to decode raw PCM audio data into an AudioBuffer
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

// Helper to parse JSON from AI response, cleaning markdown code blocks if present
function safeJsonParse(text: string) {
  if (!text) return {};
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Failure:", text);
    return {
      affirmation: "愿你的心灵如湖水般宁静。",
      news: "今日世界依旧有温暖在流动。",
      petMessage: "我一直在这里陪着你。",
      implicitAnalysis: "正在尝试触碰你的心跳...",
      musicSuggestion: { title: "Inner Peace", artist: "Nature", reason: "舒缓当下的情绪" }
    };
  }
}

// Generates daily insights based on mood, pet type, and optional image
export async function getMoodInsight(mood: MoodType, petType: PetType, note: string = "", lang: Language = 'zh', imageBase64?: string): Promise<DailyInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'zh' ? "必须使用简体中文输出" : "Must output in English";
  
  // Decide whether to use maps (for anxious/sad moods) or just search (for general positive news)
  const useMaps = mood === 'anxious' || mood === 'sad';
  const tools: any[] = useMaps ? [{ googleMaps: {} }, { googleSearch: {} }] : [{ googleSearch: {} }];
  
  let latLng = undefined;
  if (useMaps) {
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 }));
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) { console.warn("Location skipped", e); }
  }

  const systemPrompt = `You are a healing pet companion (${petType}). User mood: ${mood}. Note: "${note}". 
  Task: Provide a comforting response. 
  1. Use Google Search to find one RECENT POSITIVE news story (Good News) happening today/this week. 
  2. If user is anxious/sad, use Google Maps to find a real park or quiet place nearby.
  3. Output STRICT JSON format: { "affirmation": string, "news": string, "petMessage": string, "implicitAnalysis": string, "musicSuggestion": { "title": string, "artist": string, "reason": string } }. 
  ${langPrompt}. No extra text outside JSON.`;

  const promptParts: any[] = [{ text: systemPrompt }];
  if (imageBase64) {
    promptParts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } });
  }

  const modelName = useMaps ? "gemini-2.5-flash" : "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: promptParts },
      config: {
        tools: tools,
        toolConfig: latLng ? { retrievalConfig: { latLng } } : undefined,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const result = safeJsonParse(response.text || "{}");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places: GroundingPlace[] = [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.maps) places.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      else if (chunk.web) places.push({ title: chunk.web.title, uri: chunk.web.uri });
    });
    
    return { ...result, placesNearby: places.length > 0 ? places : undefined };
  } catch (error: any) {
    if (error.message?.includes("403")) throw new Error("API_PERMISSION_DENIED");
    throw error;
  }
}

// Generates an image of the pet using the image generation model
export async function generatePetImage(type: PetType, accessory: PetAccessory = 'none', customDescription?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = customDescription || `A professional high-fidelity 3D character render of a cute ${type} pet companion, Pixar style, wearing a ${accessory === 'none' ? 'magical glowing aura' : accessory}. Soft cinematic lighting, vibrant pastel colors, masterpiece quality.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("Failed");
  } catch (error: any) {
    if (error.message?.includes("403")) throw new Error("API_PERMISSION_DENIED");
    throw error;
  }
}

// Generates a comprehensive mood report for a given period using complex reasoning
export async function generateReport(history: MoodEntry[], period: 'weekly' | 'monthly' | 'yearly', lang: Language): Promise<ReportData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'zh' ? "必须使用简体中文输出" : "Must output in English";
  
  const historySummary = history.map(h => `Date: ${h.date}, Mood: ${h.mood}, Note: ${h.note || 'N/A'}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this mood history for a ${period} report and provide insights.
      Mood History:
      ${historySummary}
      
      ${langPrompt}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            period: { type: Type.STRING },
            summary: { type: Type.STRING, description: "A brief summary of the emotional state over the period." },
            trendAnalysis: { type: Type.STRING, description: "Analysis of how mood changed over time." },
            dominantMood: { 
              type: Type.STRING, 
              description: "The most frequent or impactful mood.",
              enum: ['happy', 'calm', 'neutral', 'anxious', 'sad', 'energetic']
            },
            advice: { type: Type.STRING, description: "Actionable advice based on the history." },
          },
          required: ["period", "summary", "trendAnalysis", "dominantMood", "advice"],
        },
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Report generation failed:", error);
    if (error.message?.includes("403")) throw new Error("API_PERMISSION_DENIED");
    
    // Return a sensible fallback if parsing or generation fails
    return {
      period,
      summary: lang === 'zh' ? "无法生成详细报告。" : "Could not generate report.",
      trendAnalysis: lang === 'zh' ? "由于数据解析问题，暂时无法分析趋势。" : "Trend analysis unavailable.",
      dominantMood: 'neutral',
      advice: lang === 'zh' ? "请继续记录您的心情，以便我们提供更好的分析。" : "Please keep recording your moods."
    };
  }
}
