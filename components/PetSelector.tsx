
import React, { useState } from 'react';
import { PetType } from '../types';
import { PetAvatar } from './PetAvatar';

interface PetSelectorProps {
  onSelect: (type: PetType, customDesc?: string) => void;
  isLoading?: boolean;
}

const pets: { type: PetType; label: string; desc: string; mood: string; bg: string }[] = [
  { type: 'dog', label: '陪伴修勾', desc: '治愈你的一切不开心', mood: '温暖忠诚', bg: 'bg-beigegray/20' },
  { type: 'cat', label: '治愈小咪', desc: '在安静中汲取能量', mood: '高冷优雅', bg: 'bg-beigegray/30' },
  { type: 'mouse', label: '灵感吱吱', desc: '发现生活的小确幸', mood: '机智敏锐', bg: 'bg-beigegray/20' },
  { type: 'kangaroo', label: '超能袋袋', desc: '强大的情绪避风港', mood: '勇敢坚韧', bg: 'bg-beigegray/30' },
  { type: 'koala', label: '梦境考拉', desc: '带你进入无忧梦境', mood: '佛系治愈', bg: 'bg-beigegray/20' },
];

export const PetSelector: React.FC<PetSelectorProps> = ({ onSelect, isLoading }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customDesc, setCustomDesc] = useState("");
  const [previewType, setPreviewType] = useState<PetType | null>(null);

  // 如果处于加载中，且有预览类型，显示加载遮罩
  if (isLoading && previewType) {
    return (
      <div className="fixed inset-0 z-[100] bg-darkblue flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
        <div className="relative mb-12">
           <div className="w-32 h-32 border-4 border-cream/20 border-t-cream rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
        </div>
        <h2 className="text-cream text-2xl font-black uppercase tracking-tighter mb-4">正在召唤你的伙伴</h2>
        <p className="text-cream/40 text-sm mb-12">我们正在为你注入灵魂与治愈魔法...</p>
        
        {/* 给予用户一个即使在加载中也能稍微平复心情的文字，或理解到这是一个可以取消的过程（虽然技术上正在API调用） */}
        <div className="px-6 py-2 bg-cream/10 rounded-full text-[10px] font-black text-cream uppercase tracking-widest">
           Awakening Ritual
        </div>
      </div>
    );
  }

  if (showCustom) {
    return (
      <div className="fixed inset-0 z-50 bg-cream p-8 flex flex-col items-center justify-center animate-in slide-in-from-bottom-10">
        <div className="absolute top-12 left-8">
           <button onClick={() => setShowCustom(false)} className="text-deepblue text-2xl">✕</button>
        </div>
        <div className="text-5xl mb-6">🪄</div>
        <h2 className="text-3xl font-black mb-4 text-deepblue tracking-tighter text-center">自定义你的守护者</h2>
        <p className="text-beigegray text-center mb-8 text-sm px-4">用一段话描述你心目中的灵魂伴侣。我们会用 AI 为你具象化。</p>
        <textarea
          value={customDesc}
          onChange={(e) => setCustomDesc(e.target.value)}
          placeholder="例如：一只长着独角兽角的赛博朋克风格的小兔子，散发柔和的蓝光..."
          className="w-full p-6 rounded-[2.5rem] bg-beigegray/20 border-2 border-beigegray/30 h-40 mb-8 outline-none focus:border-darkblue focus:ring-4 focus:ring-darkblue/5 transition-all font-medium text-sm text-deepblue shadow-inner"
        />
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => {
              setPreviewType('custom');
              onSelect('custom', customDesc);
            }}
            disabled={!customDesc || isLoading}
            className="w-full py-5 bg-darkblue text-cream rounded-full font-black uppercase tracking-widest shadow-2xl disabled:opacity-50 hover:bg-black active:scale-95 transition-all"
          >
            {isLoading ? '正在创造中...' : '创造它'}
          </button>
          <button 
            onClick={() => setShowCustom(false)} 
            className="py-4 text-beigegray font-black text-[10px] uppercase tracking-widest hover:text-darkblue transition-colors"
          >
            返回选择列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col items-center justify-start overflow-y-auto pt-16 pb-20 animate-in fade-in duration-1000">
      <div className="text-center mb-8 px-8">
        <h2 className="text-4xl font-black mb-4 tracking-tighter text-deepblue leading-tight">寻找你的<br/>绒毛守护者</h2>
        <p className="text-beigegray text-sm font-medium max-w-xs mx-auto">选择伙伴，或创造专属守护者。</p>
      </div>

      <div className="w-full px-6 mb-6">
        <button 
          onClick={() => setShowCustom(true)}
          className="w-full p-8 bg-darkblue rounded-[3rem] text-cream flex flex-col items-center shadow-xl hover:bg-black active:scale-95 transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:rotate-12 transition-transform">✨</div>
          <span className="font-black text-lg">亲手创造一个</span>
          <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">AI Custom Guardian</span>
        </button>
      </div>
      
      <div className="w-full space-y-6 px-6 pb-12">
        {pets.map(p => (
          <button
            key={p.type}
            onClick={() => {
              setPreviewType(p.type);
              onSelect(p.type);
            }}
            className={`w-full group relative flex flex-col items-center ${p.bg} p-10 rounded-[4.5rem] shadow-sm border-4 border-white hover:border-beigegray transition-all duration-500 active:scale-95`}
          >
            <div className="absolute top-8 left-10">
               <span className="px-3 py-1 bg-cream/80 rounded-full text-[10px] font-black text-deepblue uppercase tracking-widest">{p.mood}</span>
            </div>
            
            <div className="my-8 transform transition-transform duration-700 group-hover:scale-110">
              <PetAvatar type={p.type} level={1} />
            </div>

            <div className="text-center">
              <span className="block text-2xl font-black text-deepblue mb-2">{p.label}</span>
              <span className="block text-xs text-beigegray font-medium leading-relaxed px-4">{p.desc}</span>
            </div>

            <div className="mt-8 px-10 py-4 bg-darkblue text-cream rounded-[2rem] shadow-2xl group-hover:bg-black transition-all duration-300">
               <span className="text-xs font-black uppercase tracking-[0.2em]">领养 TA</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
