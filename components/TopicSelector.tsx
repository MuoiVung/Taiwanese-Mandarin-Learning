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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
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
              className="p-6 bg-white border-2 border-slate-100 rounded-xl hover:border-teal-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center mb-2">
                <MessageSquare className="text-teal-500 mr-2 group-hover:scale-110 transition-transform" size={20} />
                <h3 className="font-bold text-lg text-slate-800">{topic.title}</h3>
              </div>
              <p className="text-slate-500">{topic.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};