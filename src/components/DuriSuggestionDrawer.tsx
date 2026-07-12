import { ArrowLeft, Check, Eye, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { ItineraryItem, Place, TripCandidate } from "../domain";
import type { AnalysisIssue } from "../features/duri-analysis";
import { previewSuggestion } from "../features/duri-suggestions";
import type { DuriSuggestion, ScheduleChangePreview, ScheduleChangeState } from "../features/duri-suggestions";
import { getEndTime, sortItineraryItemsByDateAndTime } from "../utils/schedule";
import { DuriSuggestionCard } from "./DuriSuggestionCard";

type DuriSuggestionDrawerProps = {
  suggestions: DuriSuggestion[];
  itinerary: ItineraryItem[];
  tripDates: string[];
  candidates: TripCandidate[];
  placesById: Record<string, Place>;
  issuesById: Record<string, AnalysisIssue>;
  applyingSuggestionId?: string;
  onApply: (suggestion: DuriSuggestion) => void;
  onHide: (suggestionId: string) => void;
  onClose: () => void;
};

const actionLabel: Record<ScheduleChangePreview["action"], string> = {
  add: "추가",
  remove: "삭제",
  move: "이동",
  resize: "시간 변경",
  replace: "대체",
};

function ChangeState({ label, state, placesById }: { label: string; state?: ScheduleChangeState; placesById: Record<string, Place> }) {
  if (!state) return (
    <div className="mt-2 rounded-[14px] bg-[#F5F9FF] p-3">
      <p className="text-[9px] font-black text-[#8AA8D5]">{label}</p>
      <p className="mt-2 text-[11px] font-bold text-[#9BB2D5]">해당 없음</p>
    </div>
  );
  const place = state.placeId ? placesById[state.placeId] : undefined;
  const itemName = place?.name ?? state.note ?? (state.itemType === "rest" ? "휴식 시간" : state.itemType === "meal" ? "식사 시간" : "일정");
  return (
    <div className="mt-2 rounded-[14px] bg-[#F5F9FF] p-3">
      <p className="text-[9px] font-black text-[#8AA8D5]">{label}</p>
      <p className="mt-1 text-[12px] font-black text-[#243C8F]">{itemName}</p>
      <p className="mt-1 text-[10px] font-bold text-[#6988BF]">
        {state.date ?? "날짜 유지"} · {state.startTime ?? "시간 유지"}
        {state.startTime && state.durationMinutes ? `–${getEndTime(state.startTime, state.durationMinutes)}` : ""}
      </p>
      {state.durationMinutes ? <p className="mt-1 text-[9px] font-bold text-[#8CAADA]">체류 {state.durationMinutes}분</p> : null}
    </div>
  );
}

function ScheduleOrder({ label, items, placesById }: { label: string; items: ItineraryItem[]; placesById: Record<string, Place> }) {
  return (
    <div className="rounded-[16px] bg-[#F5F9FF] p-3">
      <p className="text-[9px] font-black text-[#8AA8D5]">{label}</p>
      <ol className="mt-2 space-y-2">
        {items.map((item, index) => <li key={item.id} className="flex items-center gap-2 text-[10px] font-bold text-[#536FA8]"><span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[9px] font-black text-[#4388FF]">{index + 1}</span><span>{item.startTime} · {item.placeId ? placesById[item.placeId]?.name ?? "알 수 없는 장소" : item.note ?? "일정"}</span></li>)}
      </ol>
    </div>
  );
}

function SuggestionPreview({ suggestion, itinerary, tripDates, candidates, placesById, isApplying, onBack, onApply }: { suggestion: DuriSuggestion; itinerary: ItineraryItem[]; tripDates: string[]; candidates: TripCandidate[]; placesById: Record<string, Place>; isApplying: boolean; onBack: () => void; onApply: () => void }) {
  const preview = previewSuggestion(itinerary, suggestion, { tripId: suggestion.tripId, tripDates, placesById, candidates });
  const routeDate = suggestion.type === "reorder-route" ? suggestion.changes[0]?.before?.date : undefined;
  const beforeOrder = routeDate ? sortItineraryItemsByDateAndTime(itinerary.filter((item) => item.date === routeDate)) : [];
  const afterOrder = routeDate && preview.success ? sortItineraryItemsByDateAndTime(preview.previewItinerary.filter((item) => item.date === routeDate)) : [];
  return (
    <>
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1 text-[11px] font-black text-[#6488C4]"><ArrowLeft size={14} /> 제안 목록</button>
      <div className="rounded-[20px] bg-[#EDF5FF] p-4">
        <div className="flex items-center gap-2 text-[#4388FF]"><Eye size={16} /><span className="text-[10px] font-black">적용 전 미리보기</span></div>
        <h3 className="mt-2 text-[16px] font-black leading-6 text-[#213D90]">{suggestion.title}</h3>
        <p className="mt-1 text-[11px] font-bold leading-5 text-[#6F8AC2]">{suggestion.summary}</p>
      </div>

      <div className="mt-3 space-y-3">
        {beforeOrder.length && afterOrder.length ? (
          <article className="space-y-2 rounded-[20px] border border-[#E2ECFA] bg-white p-4">
            <ScheduleOrder label="변경 전 일정 순서" items={beforeOrder} placesById={placesById} />
            <ScheduleOrder label="변경 후 일정 순서" items={afterOrder} placesById={placesById} />
          </article>
        ) : null}
        {suggestion.changes.map((change, index) => (
          <article key={`${change.itemId ?? "change"}-${index}`} className="rounded-[20px] border border-[#E2ECFA] bg-white p-4">
            <span className="inline-flex rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[9px] font-black text-[#4388FF]">{actionLabel[change.action]}</span>
            <ChangeState label="변경 전" state={change.before} placesById={placesById} />
            <ChangeState label="변경 후" state={change.after} placesById={placesById} />
          </article>
        ))}
      </div>

      {!suggestion.canApply ? <p className="mt-3 rounded-[15px] bg-[#FFF3E3] px-3 py-2 text-[10px] font-bold text-[#956E29]">{suggestion.unavailableReason}</p> : null}
      {!preview.success && suggestion.canApply ? <p className="mt-3 rounded-[15px] bg-[#FFF3E3] px-3 py-2 text-[10px] font-bold text-[#956E29]">{preview.reason}</p> : null}
      <button type="button" disabled={!suggestion.canApply || !preview.success || isApplying} onClick={onApply} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4388FF] text-[12px] font-black text-white disabled:cursor-not-allowed disabled:bg-[#C5D6ED]">
        <Check size={16} /> {isApplying ? "적용 중..." : "제안 적용"}
      </button>
    </>
  );
}

export function DuriSuggestionDrawer({ suggestions, itinerary, tripDates, candidates, placesById, issuesById, applyingSuggestionId, onApply, onHide, onClose }: DuriSuggestionDrawerProps) {
  const [selected, setSelected] = useState<DuriSuggestion>();
  return (
    <div className="absolute inset-0 z-[95] flex items-end bg-[#17336A]/35" role="dialog" aria-modal="true" aria-label="두리 제안">
      <section className="flex max-h-[88%] w-full flex-col rounded-t-[30px] bg-[#F4F8FF] px-4 pb-6 pt-4 shadow-[0_-16px_38px_rgba(36,60,143,0.2)]">
        <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-[#C8D9F1]" />
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#4388FF]"><Sparkles size={16} /><span className="text-[10px] font-black">현재 분석에서 계산</span></div>
            <h2 className="mt-1 text-[20px] font-black text-[#213D90]">두리 제안</h2>
            <p className="mt-1 text-[10px] font-bold text-[#7898CE]">적용하기 전 변경 내용을 확인할 수 있어요.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#6F95D0]"><X size={18} /></button>
        </header>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-3 no-scrollbar">
          {selected ? (
            <SuggestionPreview suggestion={selected} itinerary={itinerary} tripDates={tripDates} candidates={candidates} placesById={placesById} isApplying={applyingSuggestionId === selected.id} onBack={() => setSelected(undefined)} onApply={() => onApply(selected)} />
          ) : suggestions.length ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <DuriSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  sourceIssueTitles={suggestion.sourceIssueIds.flatMap((id) => issuesById[id]?.title ?? [])}
                  onPreview={() => setSelected(suggestion)}
                  onApply={() => onApply(suggestion)}
                  onHide={() => onHide(suggestion.id)}
                  isApplying={applyingSuggestionId === suggestion.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white px-5 py-9 text-center">
              <Sparkles size={26} className="mx-auto text-[#8BB2EC]" />
              <p className="mt-3 text-[14px] font-black text-[#213D90]">지금 바로 적용할 새 제안이 없어요</p>
              <p className="mt-1 text-[10px] font-bold text-[#7898CE]">일정을 바꾸면 현재 상태에 맞춰 다시 계산해요.</p>
            </div>
          )}
        </div>

        <button type="button" onClick={onClose} className="mt-2 h-11 shrink-0 rounded-[17px] bg-white text-[11px] font-black text-[#6F95D0]">나중에</button>
      </section>
    </div>
  );
}
