
import React from 'react';
import { VocabularyItem, Topic } from '../types';
import { BookOpen, ArrowRight, Loader2, Volume2 } from 'lucide-react';

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
      <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <BookOpen className="text-teal-600" size={32} />
                  Chuẩn bị từ vựng
                </h2>
                <p className="text-slate-500 mt-1 text-lg">Chủ đề: <span className="font-semibold text-slate-800">{topic.vietnamese_title}</span> ({topic.title})</p>
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
              <p className="text-lg">AI đang tổng hợp từ vựng quan trọng...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vocab.map((item, idx) => (
                <div key={idx} className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col h-full">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-slate-800 font-serif mb-1 group-hover:text-teal-700 transition-colors">
                      {item.chinese}
                    </div>
                    <div className="text-base text-teal-600 font-medium tracking-wide">
                      {item.pinyin}
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <div className="text-slate-600 font-medium">
                      {item.vietnamese}
                    </div>
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
