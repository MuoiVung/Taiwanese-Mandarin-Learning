import React from 'react';
import { TOCFLLevel } from '../types';
import { GraduationCap, Signal } from 'lucide-react';

interface Props {
  onSelect: (level: TOCFLLevel) => void;
}

const levels: { code: TOCFLLevel; label: string; desc: string }[] = [
  { code: 'A1', label: 'Nhập môn', desc: 'Sơ cấp 1 - Chào hỏi, mua sắm cơ bản' },
  { code: 'A2', label: 'Cơ bản', desc: 'Sơ cấp 2 - Giao tiếp đời sống hàng ngày' },
  { code: 'B1', label: 'Trung cấp 1', desc: 'Tiến cấp 1 - Du lịch, công việc đơn giản' },
  { code: 'B2', label: 'Trung cấp 2', desc: 'Tiến cấp 2 - Thảo luận, bày tỏ ý kiến' },
  { code: 'C1', label: 'Cao cấp 1', desc: 'Cao cấp 1 - Chủ đề chuyên sâu' },
  { code: 'C2', label: 'Cao cấp 2', desc: 'Cao cấp 2 - Thông thạo như người bản xứ' },
];

export const LevelSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Chào bạn! Ní hǎo!</h1>
        <p className="text-slate-600">Bạn muốn luyện tập ở trình độ nào hôm nay?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {levels.map((lvl) => (
          <button
            key={lvl.code}
            onClick={() => onSelect(lvl.code)}
            className="flex items-center p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all shadow-sm group text-left"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-bold text-xl group-hover:bg-teal-500 group-hover:text-white transition-colors">
              {lvl.code}
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-slate-800">{lvl.label}</h3>
              <p className="text-xs text-slate-500">{lvl.desc}</p>
            </div>
            <Signal className="ml-auto text-slate-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
          </button>
        ))}
      </div>
    </div>
  );
};