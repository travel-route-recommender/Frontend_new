import { ArrowRight, Eye, Sparkles, X } from "lucide-react";
import type { DuriSuggestion } from "../features/duri-suggestions";

type DuriSuggestionCardProps = {
  suggestion: DuriSuggestion;
  sourceIssueTitles: string[];
  onPreview: () => void;
  onHide: () => void;
};

const priorityLabel = { high: "우선 확인", medium: "조율 제안", low: "작은 개선" } as const;

const impactByType: Record<DuriSuggestion["type"], string> = {
  "reorder-route": "권역 왕복 흐름 완화",
  "move-item": "연속 활동 시간 완화",
  "insert-rest": "휴식 구간 확보",
  "insert-meal": "식사 누락 보완",
  "add-preference-place": "동행자 선호 반영",
  "remove-overload-item": "하루 일정 밀도 완화",
  "replace-place": "일정 수를 늘리지 않고 선호 보완",
};

const changeLabel: Record<DuriSuggestion["changes"][number]["action"], string> = {
  add: "추가",
  remove: "삭제",
  move: "이동",
  resize: "체류시간 변경",
  replace: "대체",
};

export function DuriSuggestionCard({ suggestion, sourceIssueTitles, onPreview, onHide }: DuriSuggestionCardProps) {
  return (
    <article className="rounded-[24px] border border-[#E2ECFA] bg-white p-4 shadow-[0_8px_18px_rgba(91,129,190,0.11)]">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#4F86F7] text-white shadow-[0_8px_16px_rgba(79,134,247,0.22)]">
          <Sparkles size={18} strokeWidth={2.3} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[#EAF2FF] px-2 py-1 text-[9px] font-black text-[#4F86F7]">{priorityLabel[suggestion.priority]}</span>
            <span className="text-[9px] font-black text-[#8BA8D3]">변경 {suggestion.changes.length}개</span>
            {[...new Set(suggestion.changes.map((change) => changeLabel[change.action]))].map((label) => <span key={label} className="rounded-full bg-[#F3F7FC] px-2 py-1 text-[9px] font-black text-[#7694C3]">{label}</span>)}
          </div>
          <h3 className="mt-2 text-[14px] font-black leading-5 text-[#213D90]">{suggestion.title}</h3>
          <p className="mt-1 text-[11px] font-bold leading-5 text-[#6F8AC2]">{suggestion.reason}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[15px] bg-[#F5F9FF] px-3 py-2.5">
        <p className="text-[9px] font-black text-[#8AA8D5]">해결하려는 분석</p>
        <p className="mt-1 text-[10px] font-bold text-[#506FAE]">{sourceIssueTitles.join(" · ") || "현재 일정 조율"}</p>
        <p className="mt-1 text-[10px] font-black text-[#4388FF]">예상 영향 · {impactByType[suggestion.type]}</p>
      </div>

      {!suggestion.canApply ? (
        <p id={`${suggestion.id}-unavailable`} className="mt-3 rounded-[13px] bg-[#FFF3E3] px-3 py-2 text-[10px] font-bold leading-4 text-[#956E29]">
          {suggestion.unavailableReason ?? "현재 일정에는 바로 적용할 수 없어요."}
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
        <button type="button" onClick={onPreview} className="flex h-10 items-center justify-center gap-1 rounded-[15px] bg-[#EEF5FF] text-[10px] font-black text-[#4F78BC]">
          <Eye size={13} /> 변경 내용 보기
        </button>
        <button
          type="button"
          disabled
          aria-describedby={suggestion.canApply ? `${suggestion.id}-next-step` : `${suggestion.id}-unavailable`}
          className="flex h-10 items-center justify-center gap-1 rounded-[15px] bg-[#C5D6ED] text-[10px] font-black text-white disabled:cursor-not-allowed"
        >
          제안 적용 <ArrowRight size={13} />
        </button>
        <button type="button" onClick={onHide} aria-label="이번 제안 숨기기" className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#F2F7FF] text-[#8BAFE4]">
          <X size={14} />
        </button>
      </div>
      {suggestion.canApply ? <p id={`${suggestion.id}-next-step`} className="mt-2 text-center text-[9px] font-bold text-[#8CAADA]">실제 일정 반영은 다음 작업에서 연결할 예정이에요.</p> : null}
    </article>
  );
}
