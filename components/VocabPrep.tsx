import React from 'react';
import { VocabularyItem, Topic } from '../types';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  topic: Topic;
  vocab: VocabularyItem[];
  isLoading: boolean;
  onStart: () => void;
}

export const VocabPrep: React.FC<Props> = ({ topic, vocab, isLoading, onStart }) => {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <BookOpen className="text-teal-600" />
          Chuẩn bị từ vựng
        </h2>
        <p className="text-sm text-slate-500 mt-1">Chủ đề: {topic.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang chuẩn bị từ vựng cho bạn...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vocab.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-teal-50 transition-colors">
                <div className="mb-2 sm:mb-0">
                  <div className="text-xl font-bold text-slate-800 font-serif">{item.chinese}</div>
                  <div className="text-sm text-teal-600 font-medium">{item.pinyin}</div>
                </div>
                <div className="text-slate-600 italic text-sm sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                  {item.vietnamese}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <span>Bắt đầu hội thoại</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};