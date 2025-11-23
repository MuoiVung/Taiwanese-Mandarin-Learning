
import React from 'react';
import { Topic, TOCFLLevel } from '../types';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';

interface Props {
  level: TOCFLLevel;
  topics: Topic[];
  isLoading: boolean;
  onSelect: (topic: Topic) => void;
}

export const TopicSelector: React.FC<Props> = ({ level, topics, isLoading, onSelect }) => {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            Current Level: {level}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Chủ đề hội thoại</h2>
          <p className="text-lg text-slate-600">Chọn một tình huống để bắt đầu luyện tập phản xạ.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <Loader2 className="animate-spin mb-4 text-teal-500" size={48} />
            <p className="text-lg font-medium text-slate-600">Đang tìm chủ đề phù hợp với Level {level}...</p>
            <p className="text-sm">AI đang phân tích văn hóa Đài Loan để gợi ý cho bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelect(topic)}
                className="group flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MessageSquare size={80} className="text-teal-500 rotate-12 transform translate-x-4 -translate-y-4" />
                </div>

                <div className="mb-4 relative z-10">
                   <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      <Sparkles size={24} />
                   </div>
                   <h3 className="font-bold text-xl text-slate-900 mb-1 leading-tight group-hover:text-teal-700 transition-colors">
                    {topic.title}
                  </h3>
                  <div className="text-lg text-teal-600 font-medium mb-3">
                    {topic.vietnamese_title}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 relative z-10">
                  <p className="text-sm text-slate-500 italic">
                    "{topic.description}"
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
