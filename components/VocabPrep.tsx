
import React, { useState, useEffect } from 'react';
import { VocabularyItem, Topic } from '../types';
import { BookOpen, ArrowRight, Loader2, Volume2, Quote, PlayCircle } from 'lucide-react';
import { playTTS, stopTTS } from '../utils/tts';

interface Props {
  topic: Topic;
  vocab: VocabularyItem[];
  isLoading: boolean;
  onStart: () => void;
}

export const VocabPrep: React.FC<Props> = ({ topic, vocab, isLoading, onStart }) => {
  const [playingItem, setPlayingItem] = useState<string | null>(null);

  // Initialize voices on mount
  useEffect(() => {
    const initVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = initVoices;
    initVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stopTTS();
    };
  }, []);

  const handlePlay = (text: string, id: string) => {
    if (playingItem === id) {
      stopTTS();
      setPlayingItem(null);
    } else {
      setPlayingItem(id);
      playTTS(text, undefined, () => setPlayingItem(null));
    }
  };

  return (
    <div className="h-full flex flex-col w-full relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <BookOpen className="text-teal-600" size={32} />
                  Chuẩn bị từ vựng
                </h2>
                <p className="text-slate-500 mt-2 text-lg">Chủ đề: <span className="font-semibold text-slate-800">{topic.vietnamese_title}</span> <span className="text-slate-400 text-base ml-1">({topic.title})</span></p>
             </div>
             
             {/* Desktop CTA */}
             <button
              onClick={onStart}
              disabled={isLoading || vocab.length === 0}
              className="hidden md:flex items-center px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Bắt đầu hội thoại</span>
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="animate-spin mb-4 text-teal-500" size={48} />
              <p className="text-lg">AI đang tổng hợp 10-15 từ vựng quan trọng kèm ví dụ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vocab.map((item, idx) => {
                const wordId = `word-${idx}`;
                const exampleId = `ex-${idx}`;
                
                return (
                  <div key={idx} className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col overflow-hidden">
                    {/* Main Word Section */}
                    <div className="p-5 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           <div className="text-4xl font-bold text-slate-800 font-serif group-hover:text-teal-700 transition-colors leading-tight">
                             {item.chinese}
                           </div>
                           <button 
                             onClick={() => handlePlay(item.chinese, wordId)}
                             className={`p-2 rounded-full transition-all ${playingItem === wordId ? 'text-teal-600 bg-teal-50' : 'text-slate-300 hover:text-teal-500 hover:bg-slate-50'}`}
                           >
                             <Volume2 size={24} className={playingItem === wordId ? 'animate-pulse' : ''} />
                           </button>
                        </div>
                        <div className="text-xs font-bold text-slate-300">#{idx + 1}</div>
                      </div>
                      <div className="text-xl text-teal-600 font-medium tracking-wide mb-2">
                        {item.pinyin}
                      </div>
                      <div className="text-lg text-slate-700 font-medium border-t border-slate-100 pt-2">
                        {item.vietnamese}
                      </div>
                    </div>

                    {/* Example Section */}
                    <div className="mt-auto bg-slate-50 p-4 border-t border-slate-100">
                      <div className="flex items-start gap-3 mb-2">
                        <Quote size={16} className="text-slate-400 shrink-0 mt-1.5" />
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 text-xl leading-relaxed mb-1">
                            {item.example}
                          </div>
                          <div className="text-sm text-teal-600 mb-1">{item.example_pinyin}</div>
                          <div className="text-sm text-slate-500 italic">{item.example_meaning}</div>
                        </div>
                        <button 
                             onClick={() => handlePlay(item.example, exampleId)}
                             className={`p-1.5 rounded-full transition-all shrink-0 mt-1 ${playingItem === exampleId ? 'text-teal-600 bg-teal-100' : 'text-slate-300 hover:text-teal-500 hover:bg-white'}`}
                           >
                             <Volume2 size={20} className={playingItem === exampleId ? 'animate-pulse' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Footer CTA */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10">
        <button
          onClick={onStart}
          disabled={isLoading || vocab.length === 0}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <span>Bắt đầu hội thoại</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
