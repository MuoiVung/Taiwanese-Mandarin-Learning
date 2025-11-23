import React from 'react';
import { Topic, TOCFLLevel } from '../types';
import { MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  level: TOCFLLevel;
  topics: Topic[];
  isLoading: boolean;
  onSelect: (topic: Topic) => void;
}

export const TopicSelector: React.FC<Props> = ({ level, topics, isLoading, onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-6 md:mb-8 text-center">
        <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4 inline-block">
          Level {level}
        </span>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Chọn chủ đề hội thoại</h2>
        <p className="text-slate-600">Chúng ta sẽ nói về chủ đề gì?</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Đang tìm chủ đề phù hợp...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelect(topic)}
              className="flex items-start p-4 md:p-6 bg-white border-2 border-slate-100 rounded-xl hover:border-teal-500 hover:bg-teal-50 hover:shadow-md transition-all text-left group w-full"
            >
              <div className="flex-shrink-0 mt-1">
                <MessageSquare className="text-teal-500 mr-4 group-hover:scale-110 transition-transform" size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-lg md:text-xl text-slate-800 leading-tight">
                  {topic.title}
                </h3>
                <div className="font-medium text-teal-700 text-base md:text-lg">
                  {topic.vietnamese_title}
                </div>
                <p className="text-sm text-slate-500 mt-1 italic">
                  "{topic.description}"
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};