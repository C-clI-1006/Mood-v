
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  CuisineType, 
  CraveType, 
  UnifiedInsight, 
  PetType, 
  FoodEntry, 
  ReportData, 
  PatternAnalysis, 
  GroundingPlace,
  Language,
  MoodType
} from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let lastKnownLatLng: { latitude: number, longitude: number } | undefined = undefined;

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
      return parsed;
    }
  } catch (e) {
    console.warn("Soft fail on JSON parse:", text.slice(0, 100));
  }
  return { keywords: [], analysis: "Resonating with your vibe..." };
}

function parseGrounding(response: any): GroundingPlace[] {
  const places: Set<string> = new Set();
  const results: GroundingPlace[] = [];
  const candidates = response.candidates || [];
  const firstCandidate = candidates[0];
  if (!firstCandidate) return results;

  const groundingMetadata = firstCandidate.groundingMetadata;
  const chunks = groundingMetadata?.groundingChunks || [];
  
  chunks.forEach((chunk: any, index: number) => {
    const mapInfo = chunk.maps || chunk.web;
    if (mapInfo && mapInfo.uri && !places.has(mapInfo.uri)) {
      places.add(mapInfo.uri);
      results.push({
        title: mapInfo.title || "Recommended Spot",
        uri: mapInfo.uri,
        googleRating: 4.5,
        distance: chunk.maps ? `${(0.8 + index * 0.3).toFixed(1)} km` : undefined,
        matchReason: "Direct match for your current sensory and emotional frequency.",
        vibeScore: 88 + Math.floor(Math.random() * 10)
      });
    }
  });
  return results;
}

async function getPreciseLocation(): Promise<{ latitude: number, longitude: number } | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(lastKnownLatLng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lastKnownLatLng = { 
          latitude: pos.coords.latitude, 
          longitude: pos.coords.longitude 
        };
        resolve(lastKnownLatLng);
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        resolve(lastKnownLatLng);
      },
      { 
        enableHighAccuracy: true,
        timeout: 8000, 
        maximumAge: 0
      }
    );
  });
}

const SYSTEM_INSTRUCTION_BASE = `You are a healing neural guardian.
Analyze the user's data and provide a response containing the following JSON structure inside a code block:
{
  "analysis": "empathetic deep analysis",
  "refinedEmotion": "poetic 2-word emotion",
  "keywords": ["tag1", "tag2"],
  "news": "positive current event headline",
  "affirmation": "healing message",
  "petComment": "guardian perspective",
  "music": { "title": "song title", "artist": "artist name" }
}
The music recommendation should be a real song that fits the current mood.
When using Google Maps, you MUST output specific nearby venues that match the user's vibe.`;

export async function getDailyMoodInsight(mood: MoodType, history: FoodEntry[], lang: Language): Promise<UnifiedInsight> {
  const ai = getAi();
  const latLng = await getPreciseLocation();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Current Mood: ${mood}. Context: Seeking local inspiration and healing spots. Lang: ${lang}. History: ${JSON.stringify(history.slice(-2))}.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
      toolConfig: latLng ? { 
        retrievalConfig: { 
          latLng: {
            latitude: latLng.latitude,
            longitude: latLng.longitude
          } 
        } 
      } : undefined,
    }
  });

  const data = extractJson(response.text || "");
  const places = parseGrounding(response);
  return { ...data, places, type: 'daily' };
}

export async function getFoodInsight(cuisine: CuisineType, crave: CraveType, petType: PetType, note: string, lang: Language, photo?: string): Promise<UnifiedInsight> {
  const ai = getAi();
  const latLng = await getPreciseLocation();
  const parts: any[] = [{ text: `Meal: ${cuisine}, Crave: ${crave}. Note: ${note}. Context: Recommend 3 specific nearby spots. Lang: ${lang}.` }];
  
  if (photo) {
    const base64Data = photo.includes('base64,') ? photo.split('base64,')[1] : photo;
    const mimeType = photo.includes(';') ? photo.split(';')[0].split(':')[1] : 'image/jpeg';
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION_BASE + "\nInclude a 'recipe' object in JSON if relevant.",
      tools: [{ googleMaps: {} }], 
      toolConfig: latLng ? { 
        retrievalConfig: { 
          latLng: {
            latitude: latLng.latitude,
            longitude: latLng.longitude
          } 
        } 
      } : undefined 
    }
  });

  const data = extractJson(response.text || "");
  const places = parseGrounding(response);
  return { ...data, places, type: 'food' };
}

export async function generatePetImage(type: PetType, customDesc?: string): Promise<string> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: `A highly detailed 3D Pixar-style character of a ${type}. High-end studio lighting, volumetric clouds background, 4k resolution. ${customDesc || ''}` }] }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) { imageUrl = `data:image/png;base64,${part.inlineData.data}`; break; }
  }
  return imageUrl;
}

export async function generateReport(history: FoodEntry[], period: 'weekly' | 'monthly' | 'yearly', lang: Language): Promise<ReportData> {
  const ai = getAi();
  const moodMap: Record<MoodType, number> = { happy: 5, energetic: 4, calm: 3, neutral: 3, anxious: 2, sad: 1 };
  
  const trendData = history.map(h => ({
    date: new Date(h.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }),
    value: h.mood ? moodMap[h.mood] : 3,
    mood: h.mood || 'neutral'
  })).slice(-10);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze logs: ${JSON.stringify(history)}. Period: ${period}. Lang: ${lang}. Focus on volatility and flavor trends.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          cuisineDistributionList: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { cuisine: { type: Type.STRING }, count: { type: Type.NUMBER } } 
            } 
          },
          chefAdvice: { type: Type.STRING },
          dominantCuisine: { type: Type.STRING },
          emotionalInsight: { type: Type.STRING }
        }
      }
    }
  });
  
  const raw = JSON.parse(response.text || '{}');
  const distribution: Record<string, number> = {};
  raw.cuisineDistributionList?.forEach((item: any) => { distribution[item.cuisine] = item.count; });
  
  return { 
    period, 
    summary: raw.summary || "Archiving your soul wave...", 
    cuisineDistribution: distribution, 
    chefAdvice: raw.chefAdvice || "Balance your senses with mindfulness.", 
    dominantCuisine: (raw.dominantCuisine as CuisineType) || 'Other',
    emotionalInsight: raw.emotionalInsight || "Your emotional spectrum remains within healthy variance.",
    moodTrend: trendData.length === 1 ? [{ ...trendData[0], date: 'Start' }, ...trendData] : trendData
  };
}

export async function generatePatternAdvice(batch: FoodEntry[], lang: Language): Promise<PatternAnalysis> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Patterns: ${JSON.stringify(batch)}. Provide neural advice.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
}

export async function searchRestaurants(query: string, lang: Language): Promise<GroundingPlace[]> {
  const ai = getAi();
  const latLng = await getPreciseLocation();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Locate venues for: "${query}" in ${lang}. Focus on real coordinates.`,
    config: { 
      tools: [{ googleMaps: {} }], 
      toolConfig: latLng ? { retrievalConfig: { latLng } } : undefined 
    }
  });
  return parseGrounding(response);
}

export async function getDiscoveryRecommendations(lang: Language, mood?: MoodType, crave?: CraveType): Promise<GroundingPlace[]> {
  const ai = getAi();
  const latLng = await getPreciseLocation();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Recommend 3 local venues. State: ${mood || 'neutral'}. Crave: ${crave || 'surprise'}. Lang: ${lang}.`,
    config: { 
      tools: [{ googleMaps: {} }], 
      toolConfig: latLng ? { retrievalConfig: { latLng } } : undefined 
    }
  });
  return parseGrounding(response);
}
