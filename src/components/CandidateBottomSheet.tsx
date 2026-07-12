import { Check, GripVertical, Plus, Search, Sparkles, UserRound } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDraggable } from "@dnd-kit/react";
import type { FilterKey } from "../data/workspace";
import { formatScheduleDate } from "../utils/schedule";
import type { CandidateView, ItineraryView } from "./workspaceViewModels";
import type { WorkspaceDragData } from "./workspaceDnd";

export type CandidateSheetState = "collapsed" | "half" | "expanded";

type CandidateBottomSheetProps = {
  state: CandidateSheetState;
  filters: FilterKey[];
  activeFilter: FilterKey;
  candidates: CandidateView[];
  schedule: ItineraryView[];
  tripDates: string[];
  unplannedCount: number;
  dragDisabled?: boolean;
  onStateChange: (state: CandidateSheetState) => void;
  onFilterChange: (filter: FilterKey) => void;
  onQuickAdd: (candidate: CandidateView) => void;
};

const sheetOrder: CandidateSheetState[] = ["collapsed", "half", "expanded"];

export function CandidateBottomSheet({
  state,
  filters,
  activeFilter,
  candidates,
  schedule,
  tripDates,
  unplannedCount,
  dragDisabled,
  onStateChange,
  onFilterChange,
  onQuickAdd,
}: CandidateBottomSheetProps) {
  const [query, setQuery] = useState("");
  const gestureRef = useRef<{ pointerId: number; startY: number } | undefined>(undefined);
  const visibleCandidates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return candidates;
    return candidates.filter(({ place }) => [place.name, place.category, ...place.tags].join(" ").toLocaleLowerCase().includes(normalized));
  }, [candidates, query]);
  const heightClass = state === "collapsed" ? "h-[96px]" : state === "half" ? "h-[42vh] min-h-[330px]" : "h-[74vh]";

  const moveState = (direction: -1 | 1) => {
    const index = sheetOrder.indexOf(state);
    onStateChange(sheetOrder[Math.min(Math.max(index + direction, 0), sheetOrder.length - 1)]);
  };

  return (
    <aside className={`fixed bottom-[86px] left-1/2 z-40 flex w-[calc(100%-28px)] max-w-[402px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[30px] bg-white pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-14px_30px_rgba(91,129,190,0.22)] transition-[height] duration-200 ${heightClass}`} aria-label="후보 장소 보드">
      <button
        type="button"
        className="shrink-0 pb-1 pt-3"
        aria-label={`후보 장소 보드 ${state === "expanded" ? "축소" : "확장"}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          gestureRef.current = { pointerId: event.pointerId, startY: event.clientY };
        }}
        onPointerUp={(event) => {
          const gesture = gestureRef.current;
          gestureRef.current = undefined;
          if (!gesture || gesture.pointerId !== event.pointerId) return;
          const delta = event.clientY - gesture.startY;
          if (Math.abs(delta) > 38) moveState(delta < 0 ? 1 : -1);
          else moveState(state === "expanded" ? -1 : 1);
        }}
        onPointerCancel={() => { gestureRef.current = undefined; }}
      >
        <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#B8D3F7]" />
      </button>

      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-1">
        <div>
          <p className="text-[11px] font-black text-[#4F86F7]">후보 장소 보드</p>
          <h2 className="mt-0.5 text-[17px] font-black text-[#213D90]">미배치 {unplannedCount}곳</h2>
        </div>
        <p className="rounded-full bg-[#EEF5FF] px-3 py-2 text-[10px] font-black text-[#6F95D0]">핸들을 길게 눌러 배치</p>
      </div>

      {state !== "collapsed" ? (
        <>
          <div className="shrink-0 px-5">
            <label className="flex h-11 items-center gap-2 rounded-[16px] bg-[#F3F7FD] px-3">
              <Search size={16} className="text-[#8FB4E7]" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="후보 장소 검색" aria-label="후보 장소 검색" className="min-w-0 flex-1 bg-transparent text-[13px] font-bold text-[#243C8F] outline-none placeholder:text-[#A9BFDF]" />
            </label>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {filters.map((filter) => (
                <button key={filter} type="button" onClick={() => onFilterChange(filter)} className={`h-9 shrink-0 rounded-full px-3.5 text-[11px] font-black ${activeFilter === filter ? "bg-[#4F86F7] text-white" : "bg-[#F0F6FF] text-[#8BAFE4]"}`}>{filter}</button>
              ))}
            </div>
          </div>

          <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 pb-3 pr-4">
            {visibleCandidates.length ? visibleCandidates.map((view) => (
              <CandidateRow key={view.place.id} view={view} schedule={schedule} tripDates={tripDates} dragDisabled={dragDisabled} onQuickAdd={() => onQuickAdd(view)} />
            )) : (
              <div className="rounded-[20px] bg-[#F7FBFF] px-4 py-6 text-center">
                <p className="text-[13px] font-black text-[#213D90]">{candidates.length ? "검색 결과가 없어요." : "아직 후보 장소가 없어요."}</p>
                {!candidates.length ? <Link to="/explore" className="mt-3 inline-flex h-10 items-center justify-center rounded-[15px] bg-[#4388FF] px-4 text-[12px] font-black text-white">장소 탐색하기</Link> : null}
              </div>
            )}
          </div>
        </>
      ) : null}
    </aside>
  );
}

function CandidateRow({
  view,
  schedule,
  tripDates,
  dragDisabled,
  onQuickAdd,
}: {
  view: CandidateView;
  schedule: ItineraryView[];
  tripDates: string[];
  dragDisabled?: boolean;
  onQuickAdd: () => void;
}) {
  const { candidate, place, addedByUsers } = view;
  const scheduledItem = schedule.find((entry) => entry.item.placeId === place.id)?.item;
  const dateIndex = scheduledItem ? tripDates.indexOf(scheduledItem.date) : -1;
  const placement = scheduledItem
    ? `${formatScheduleDate(scheduledItem.date, Math.max(dateIndex, 0)).dayLabel} · ${scheduledItem.startTime} 배치됨`
    : "미배치";
  const data: WorkspaceDragData = { kind: "candidate", placeId: place.id, name: place.name };
  const { ref, handleRef, isDragging } = useDraggable<WorkspaceDragData>({
    id: `candidate:${place.id}`,
    data,
    type: "candidate",
    disabled: Boolean(scheduledItem || dragDisabled),
  });

  return (
    <article ref={ref} className={`flex items-center gap-3 rounded-[20px] bg-[#F7FBFF] p-2.5 transition-opacity ${isDragging ? "opacity-35" : "opacity-100"}`}>
      <div className="h-12 w-12 shrink-0 rounded-[15px] bg-cover bg-center" style={{ backgroundImage: `url(${place.imageUrl})` }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[13px] font-black text-[#213D90]">{place.name}</h3>
          {candidate.recommendedByDuri ? <Sparkles size={12} className="shrink-0 text-[#4388FF]" aria-label="두리 추천" /> : null}
        </div>
        <p className="mt-0.5 truncate text-[10px] font-black text-[#8BAFE4]">{place.category} · {place.tags.slice(0, 2).join(" · ")}</p>
        <p className={`mt-1 flex items-center gap-1 truncate text-[9px] font-bold ${scheduledItem ? "text-[#4388FF]" : "text-[#9ABBEA]"}`}>
          {scheduledItem ? <Check size={10} /> : <UserRound size={10} />}{scheduledItem ? placement : `${addedByUsers.map((user) => user.name).join(", ")} 담음`}
        </p>
      </div>
      <button ref={handleRef} type="button" disabled={Boolean(scheduledItem || dragDisabled)} aria-label={`${place.name} 일정으로 드래그`} className={`grid h-9 w-9 shrink-0 touch-none place-items-center rounded-[14px] ${scheduledItem ? "cursor-not-allowed bg-[#DCE9FA] text-[#9ABBEA]" : "bg-white text-[#6F9DDB] active:scale-95"}`}>
        <GripVertical size={16} />
      </button>
      <button type="button" onClick={onQuickAdd} disabled={Boolean(scheduledItem || dragDisabled)} aria-label={`${place.name} 일정에 추가`} className={`grid h-9 w-9 shrink-0 place-items-center rounded-[14px] text-white ${scheduledItem || dragDisabled ? "cursor-not-allowed bg-[#B8D3F7]" : "bg-[#4F86F7]"}`}>
        {scheduledItem ? <Check size={15} /> : <Plus size={16} />}
      </button>
    </article>
  );
}
