
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../services/geminiService';
import { translations } from '../translations';
import { Language } from '../types';

interface LiveTreeHoleProps {
  onClose: () => void;
  lang: Language;
  petType: string;
}

export const LiveTreeHole: React.FC<LiveTreeHoleProps> = ({ onClose, lang, petType }) => {
  const [isActive, setIsActive] = useState(false);
  const t = translations[lang];
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = inputCtx;
    outputAudioContextRef.current = outputCtx;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const buffer = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsActive(false),
        onerror: (e) => console.error("Live Error", e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: `You are a healing pet companion (${petType}). Listen to user's secrets and provide comfort. Use ${lang === 'zh' ? 'Chinese' : 'English'}.`
      }
    });
    sessionRef.current = await sessionPromise;
  };

  useEffect(() => {
    startSession();
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-darkblue/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-cream">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-beigegray rounded-full blur-3xl animate-pulse opacity-10" />
        <div className={`w-40 h-40 rounded-full border-4 ${isActive ? 'border-beigegray animate-ping' : 'border-cream/20'} flex items-center justify-center`}>
          <div className="w-32 h-32 bg-deepblue rounded-full flex items-center justify-center text-4xl shadow-2xl">🎙️</div>
        </div>
      </div>
      <h2 className="text-2xl font-light mb-2">{isActive ? t.hearing : t.magicInProgress}</h2>
      <p className="text-beigegray text-sm mb-12 text-center max-w-xs">{translations[lang].talkToMe}</p>
      
      <button 
        onClick={onClose}
        className="px-12 py-4 bg-cream text-deepblue rounded-full font-bold text-sm tracking-widest active:scale-95 transition-all shadow-xl hover:bg-beigegray"
      >
        {t.stopTalking}
      </button>
    </div>
  );
};
