
import React from 'react';
import { TOCFLLevel } from '../types';
import { GraduationCap, Signal, ArrowRight } from 'lucide-react';

interface Props {
  onSelect: (level: TOCFLLevel) => void;
}

const levels: { code: TOCFLLevel; label: string; desc: string; color: string }[] = [
  { code: 'A1', label: 'Nhập môn', desc: 'Chào hỏi, mua sắm cơ bản, số đếm', color: 'bg-emerald-100 text-emerald-700' },
  { code: 'A2', label: 'Cơ bản', desc: 'Giao tiếp đời sống hàng ngày, chỉ đường', color: 'bg-teal-100 text-teal-700' },
  { code: 'B1', label: 'Trung cấp 1', desc: 'Du lịch, công việc đơn giản, sở thích', color: 'bg-cyan-100 text-cyan-700' },
  { code: 'B2', label: 'Trung cấp 2', desc: 'Thảo luận ý kiến, văn hóa, xã hội', color: 'bg-sky-100 text-sky-700' },
  { code: 'C1', label: 'Cao cấp 1', desc: 'Chủ đề chuyên sâu, tin tức, kinh tế', color: 'bg-blue-100 text-blue-700' },
  { code: 'C2', label: 'Cao cấp 2', desc: 'Thông thạo, tranh luận, văn học', color: 'bg-indigo-100 text-indigo-700' },
];

export const LevelSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-teal-100 text-teal-700 mb-4 shadow-sm">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Chọn trình độ của bạn</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Hãy chọn cấp độ phù hợp để AI có thể điều chỉnh từ vựng và tốc độ nói chuyện tốt nhất cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((lvl) => (
            <button
              key={lvl.code}
              onClick={() => onSelect(lvl.code)}
              className="group relative flex flex-col p-6 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${lvl.color} font-bold text-xl`}>
                  {lvl.code}
                </div>
                <Signal className="text-slate-200 group-hover:text-teal-500 transition-colors" size={24} />
              </div>
              
              <div className="mb-4 flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{lvl.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{lvl.desc}</p>
              </div>

              <div className="flex items-center text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                <span>Chọn cấp độ này</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
