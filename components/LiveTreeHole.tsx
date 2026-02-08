
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import React, { useEffect, useRef, useState } from 'react';
import { decode, decodeAudioData, encode } from '../services/geminiService';
import { translations } from '../translations';
import { Language } from '../types';

interface LiveTreeHoleProps {
  onClose: () => void;
  lang: Language;
  petType: string;
  petImageUrl?: string;
}

export const LiveTreeHole: React.FC<LiveTreeHoleProps> = ({ onClose, lang, petType, petImageUrl }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = translations[lang];
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Crucial for iOS/Safari: context must be resumed via user interaction
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
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
            const parts = message.serverContent?.modelTurn?.parts;
            const base64 = parts?.[0]?.inlineData?.data;

            if (base64) {
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            setIsActive(false);
            onClose();
          },
          onerror: (e) => { 
            console.error("Live Error Details:", e); 
            setIsConnecting(false); 
          }
        },
        config: {
          // Changed to string array for strict backend matching
          responseModalities: ['AUDIO'], 
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Kore' } 
            } 
          },
          systemInstruction: `You are a healing pet companion (${petType}). Listen deeply and provide short, warm, spoken comfort. Respond in ${lang === 'zh' ? 'Chinese' : 'English'}. Keep it concise, empathetic, and spoken like a caring friend.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Live Session Establishment Failed:", e);
      setIsConnecting(false);
    }
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
        <div className={`absolute inset-0 bg-indigo-500 rounded-full blur-[80px] transition-opacity duration-1000 ${isActive ? 'opacity-30 animate-pulse' : 'opacity-10'}`} />
        <div className={`w-52 h-52 rounded-full border-2 ${isActive ? 'border-cream/40 scale-105' : 'border-cream/10 scale-100'} flex items-center justify-center transition-all duration-700 relative`}>
          <div className={`w-44 h-44 rounded-full overflow-hidden flex items-center justify-center text-4xl shadow-2xl relative z-10 border-4 border-white/10 ${isSpeaking ? 'animate-bounce' : 'animate-pulse'}`}>
            {isConnecting ? (
               <div className="w-10 h-10 border-4 border-cream border-t-transparent rounded-full animate-spin" />
            ) : petImageUrl ? (
               <img src={petImageUrl} className="w-full h-full object-cover" alt="Guardian" />
            ) : (
               '✨'
            )}
          </div>
          {isActive && (
            <div className="absolute inset-0 animate-ping opacity-20 border-2 border-cream rounded-full pointer-events-none" />
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          {isConnecting ? t.magicInProgress : isActive ? (isSpeaking ? 'Guardian Speaking' : t.hearing) : 'Offline'}
        </h2>
        <p className="text-beigegray text-[10px] uppercase font-bold tracking-[0.4em] opacity-60">
           {isActive ? translations[lang].talkToMe : 'Syncing Neural Link...'}
        </p>
      </div>
      
      <div className="mt-16">
        <button 
          onClick={() => { sessionRef.current?.close(); onClose(); }}
          className="px-12 py-5 bg-white/5 border border-white/10 text-cream rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl hover:bg-white/10"
        >
          {t.stopTalking}
        </button>
      </div>
    </div>
  );
};
