
import React, { useState } from 'react';
import { TOCFLLevel } from '../types';
import { Signal, PenLine, Sparkles, BookOpen, ArrowRight, X } from 'lucide-react';

interface Props {
  onSelect: (level: TOCFLLevel) => void;
  onCustomStart: (topic: string, level: TOCFLLevel) => void;
}

const levels: { code: TOCFLLevel; label: string; desc: string; color: string }[] = [
  { code: 'A1', label: 'Nhập môn', desc: 'Chào hỏi, mua sắm cơ bản', color: 'bg-emerald-100 text-emerald-700' },
  { code: 'A2', label: 'Cơ bản', desc: 'Giao tiếp đời sống hàng ngày', color: 'bg-teal-100 text-teal-700' },
  { code: 'B1', label: 'Trung cấp 1', desc: 'Du lịch, công việc, sở thích', color: 'bg-cyan-100 text-cyan-700' },
  { code: 'B2', label: 'Trung cấp 2', desc: 'Thảo luận ý kiến, xã hội', color: 'bg-sky-100 text-sky-700' },
  { code: 'C1', label: 'Cao cấp 1', desc: 'Chuyên sâu, tin tức, kinh tế', color: 'bg-blue-100 text-blue-700' },
  { code: 'C2', label: 'Cao cấp 2', desc: 'Tranh luận, triết học', color: 'bg-indigo-100 text-indigo-700' },
];

export const LevelSelector: React.FC<Props> = ({ onSelect, onCustomStart }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedCustomLevel, setSelectedCustomLevel] = useState<TOCFLLevel | null>(null);

  const toggleCustomLevel = (lvl: TOCFLLevel) => {
    if (selectedCustomLevel === lvl) {
      setSelectedCustomLevel(null); // Deselect if already selected
    } else {
      setSelectedCustomLevel(lvl);
    }
  };

  const handleStartCustom = () => {
    if (!customTopic.trim()) return;
    // If no level selected, default to 'Native'
    onCustomStart(customTopic, selectedCustomLevel || 'Native');
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 w-full bg-slate-50">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Area */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">Luyện giao tiếp Tiếng Trung</h1>
          <p className="text-slate-600 text-lg">Bạn muốn bắt đầu như thế nào?</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => setActiveTab('standard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                activeTab === 'standard' 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <BookOpen size={20} />
              <span>Theo lộ trình</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                activeTab === 'custom' 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <PenLine size={20} />
              <span>Tự nhập chủ đề</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* STANDARD TAB CONTENT */}
          {activeTab === 'standard' && (
            <div>
              <div className="text-center mb-8">
                 <h2 className="text-xl font-bold text-slate-700 mb-2">Chọn cấp độ của bạn</h2>
                 <p className="text-slate-500">AI sẽ gợi ý các chủ đề phù hợp với trình độ này.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {levels.map((lvl) => (
                  <button
                    key={lvl.code}
                    onClick={() => onSelect(lvl.code)}
                    className="group relative flex flex-col p-6 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${lvl.color} font-bold text-lg`}>
                        {lvl.code}
                      </div>
                      <Signal className="text-slate-200 group-hover:text-teal-500 transition-colors" size={20} />
                    </div>
                    <div className="mb-2 flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-teal-700 transition-colors">{lvl.label}</h3>
                      <p className="text-sm text-slate-500">{lvl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOM TAB CONTENT */}
          {activeTab === 'custom' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Ý tưởng của bạn là gì?</h2>
                 <p className="text-slate-500">Nhập bất cứ chủ đề nào bạn muốn, AI sẽ đóng vai cùng bạn.</p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Chủ đề cuộc trò chuyện</label>
                <textarea 
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ví dụ: Cãi nhau với người yêu, Phỏng vấn xin việc tại TSMC, Đi cắt tóc..."
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-lg min-h-[120px] resize-none"
                />
              </div>

              <div className={`transition-all duration-500 ${customTopic.trim() ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                     Chọn trình độ (Tùy chọn)
                  </span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
                  {levels.map((lvl) => {
                    const isSelected = selectedCustomLevel === lvl.code;
                    return (
                      <button
                        key={lvl.code}
                        onClick={() => toggleCustomLevel(lvl.code)}
                        className={`
                          flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                          ${isSelected 
                             ? 'ring-2 ring-teal-500 bg-teal-50 border-teal-500 transform scale-105 shadow-md' 
                             : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50'
                          }
                        `}
                      >
                        <span className={`font-bold text-lg mb-1 ${isSelected ? 'text-teal-700' : 'text-slate-600'}`}>
                          {lvl.code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleStartCustom}
                    disabled={!customTopic.trim()}
                    className={`
                      relative w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all
                      ${customTopic.trim() 
                        ? 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-[1.02] active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <span>Bắt đầu trò chuyện</span>
                    {!selectedCustomLevel && customTopic.trim() && (
                      <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded text-white ml-1">Native Mode</span>
                    )}
                    <ArrowRight size={20} />
                  </button>
                </div>

                {!selectedCustomLevel && customTopic.trim() && (
                  <p className="text-center text-slate-400 text-sm mt-4 italic">
                    Không chọn level? AI sẽ nói chuyện tự nhiên như người bản xứ.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
