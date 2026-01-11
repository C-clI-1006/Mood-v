
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
  const [isConnecting, setIsConnecting] = useState(true);
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
          onerror: (e) => { console.error("Live Error", e); setIsConnecting(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `You are a healing pet companion (${petType}). Listen deeply and provide short, warm, spoken comfort. Use ${lang === 'zh' ? 'Chinese' : 'English'}.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Session failed", e);
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
        <div className={`absolute inset-0 bg-cream rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-20 animate-pulse' : 'opacity-5'}`} />
        <div className={`w-40 h-40 rounded-full border-4 ${isActive ? 'border-cream scale-110 animate-pulse' : 'border-cream/20 scale-100'} flex items-center justify-center transition-all duration-700`}>
          <div className="w-32 h-32 bg-deepblue rounded-full flex items-center justify-center text-4xl shadow-2xl relative z-10">
            {isConnecting ? <div className="w-8 h-8 border-4 border-cream border-t-transparent rounded-full animate-spin" /> : '🎙️'}
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-light mb-2">{isConnecting ? t.magicInProgress : isActive ? t.hearing : 'Offline'}</h2>
      <p className="text-beigegray text-sm mb-12 text-center max-w-xs">{isActive ? translations[lang].talkToMe : 'Connection failed. Please try again.'}</p>
      
      <button 
        onClick={onClose}
        className="px-12 py-4 bg-darkblue border border-cream/20 text-cream rounded-full font-bold text-sm tracking-widest active:scale-95 transition-all shadow-xl"
      >
        {t.stopTalking}
      </button>
    </div>
  );
};
