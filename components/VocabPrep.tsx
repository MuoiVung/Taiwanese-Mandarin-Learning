
import React from 'react';
import { VocabularyItem, Topic } from '../types';
import { BookOpen, ArrowRight, Loader2, Volume2, Quote } from 'lucide-react';

interface Props {
  topic: Topic;
  vocab: VocabularyItem[];
  isLoading: boolean;
  onStart: () => void;
}

export const VocabPrep: React.FC<Props> = ({ topic, vocab, isLoading, onStart }) => {
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
              {vocab.map((item, idx) => (
                <div key={idx} className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col overflow-hidden">
                  {/* Main Word Section */}
                  <div className="p-5 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-3xl font-bold text-slate-800 font-serif group-hover:text-teal-700 transition-colors">
                        {item.chinese}
                      </div>
                      <div className="text-xs font-bold text-slate-300">#{idx + 1}</div>
                    </div>
                    <div className="text-lg text-teal-600 font-medium tracking-wide mb-2">
                      {item.pinyin}
                    </div>
                    <div className="text-slate-700 font-medium border-t border-slate-100 pt-2">
                      {item.vietnamese}
                    </div>
                  </div>

                  {/* Example Section */}
                  <div className="mt-auto bg-slate-50 p-4 border-t border-slate-100 text-sm">
                    <div className="flex gap-2 mb-1">
                      <Quote size={14} className="text-slate-400 shrink-0 mt-1" />
                      <div className="font-medium text-slate-700">{item.example}</div>
                    </div>
                    <div className="pl-6 text-slate-500 mb-1 italic text-xs">{item.example_pinyin}</div>
                    <div className="pl-6 text-slate-500 text-xs border-t border-slate-200 pt-1 mt-1">{item.example_meaning}</div>
                  </div>
                </div>
              ))}
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
