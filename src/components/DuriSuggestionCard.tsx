import { ArrowRight, Pencil, Sparkles, X } from "lucide-react";

type DuriSuggestionCardProps = {
  suggestion: string;
  onApply: () => void;
};

export function DuriSuggestionCard({ suggestion, onApply }: DuriSuggestionCardProps) {
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.14)]">
      <div className="flex gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#4F86F7] text-white shadow-[0_10px_18px_rgba(79,134,247,0.24)]">
          <Sparkles size={20} strokeWidth={2.3} />
        </div>
        <div>
          <p className="text-xs font-black text-[#4F86F7]">두리 제안</p>
          <p className="mt-1 text-[14px] font-bold leading-6 text-[#213D90]">{suggestion}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onApply}
          className="flex h-11 items-center justify-center gap-1.5 rounded-[17px] bg-[#4F86F7] text-xs font-black text-white transition hover:bg-[#3F73E8]"
        >
          반영
          <ArrowRight size={14} />
        </button>
        <button className="flex h-11 items-center justify-center gap-1.5 rounded-[17px] bg-[#F2F7FF] text-xs font-black text-[#8BAFE4]">
          <X size={14} />
          나중에
        </button>
        <button className="flex h-11 items-center justify-center gap-1.5 rounded-[17px] bg-[#F2F7FF] text-xs font-black text-[#8BAFE4]">
          <Pencil size={14} />
          수정
        </button>
      </div>
    </article>
  );
}
