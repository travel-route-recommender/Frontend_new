import { Check, ChevronDown, ChevronUp, Plus, UserRound } from "lucide-react";
import type { CandidatePlace, DayKey, FilterKey, ScheduledPlace } from "../data/workspace";

type CandidateBottomSheetProps = {
  expanded: boolean;
  onToggle: () => void;
  filters: FilterKey[];
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  candidates: CandidatePlace[];
  schedule: ScheduledPlace[];
  selectedDay: DayKey;
  onAddPlace: (place: CandidatePlace) => void;
};

export function CandidateBottomSheet({
  expanded,
  onToggle,
  filters,
  activeFilter,
  onFilterChange,
  candidates,
  schedule,
  selectedDay,
  onAddPlace,
}: CandidateBottomSheetProps) {
  if (!expanded) {
    return (
      <aside className="fixed bottom-[86px] left-1/2 z-30 w-[calc(100%-28px)] max-w-[402px] -translate-x-1/2">
        <button
          onClick={onToggle}
          className="mx-auto flex h-5 w-24 items-center justify-center rounded-full bg-white/80 shadow-[0_4px_14px_rgba(91,129,190,0.18)] backdrop-blur"
          aria-label="후보 장소 펼치기"
        >
          <span className="block h-1.5 w-10 rounded-full bg-[#B8D3F7]" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="fixed bottom-[88px] left-1/2 z-30 max-h-[64vh] w-[calc(100%-28px)] max-w-[402px] -translate-x-1/2 rounded-t-[30px] bg-white px-5 pb-4 pt-3 shadow-[0_-12px_28px_rgba(91,129,190,0.2)] transition-all"
    >
      <button onClick={onToggle} className="mx-auto block w-full pb-2" aria-label={expanded ? "후보 장소 접기" : "후보 장소 펼치기"}>
        <span className="mx-auto block h-1.5 w-11 rounded-full bg-[#B8D3F7]" />
      </button>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-[#4F86F7]">후보 장소 보드</p>
          <h2 className="text-[20px] font-black leading-tight tracking-normal text-[#213D90]">
            {selectedDay === "전체" ? "Day 1" : selectedDay}에 추가할 장소
          </h2>
        </div>
        <button
          onClick={onToggle}
          className="grid h-10 w-10 place-items-center rounded-[16px] bg-[#F0F6FF] text-[#8BAFE4] transition hover:bg-[#E2EEFF]"
        >
          {expanded ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`h-10 shrink-0 rounded-full px-4 text-xs font-black transition ${
              activeFilter === filter ? "bg-[#4F86F7] text-white" : "bg-[#F0F6FF] text-[#8BAFE4]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-[44vh] space-y-2 overflow-y-auto pr-1">
        {candidates.map((place) => {
          const scheduledDay = schedule.find((item) => item.sourcePlaceId === place.id)?.day;
          const status = scheduledDay ? `${scheduledDay} 배치됨` : "미배치";
          const isPlaced = Boolean(scheduledDay);

          return (
            <article key={place.id} className="flex items-center gap-3 rounded-[20px] bg-[#F7FBFF] p-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#E4EEFF] text-[#4F86F7]">
                <Plus size={19} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[14px] font-black text-[#213D90]">{place.name}</h3>
                  {place.recommended ? (
                    <span className="shrink-0 rounded-full bg-[#DCEBFF] px-2 py-0.5 text-[10px] font-black text-[#4F86F7]">
                      두리
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-[12px] font-black text-[#8BAFE4]">{place.tags.join(", ")}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#9ABBEA]">
                  <UserRound size={12} />
                  {place.addedBy.join(", ")} 담음 · {status}
                </p>
              </div>
              <button
                onClick={() => onAddPlace(place)}
                disabled={isPlaced}
                aria-label={`${place.name} 추가`}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-[16px] text-white transition ${
                  isPlaced ? "bg-[#B8D3F7]" : "bg-[#4F86F7] hover:bg-[#3F73E8]"
                }`}
              >
                {isPlaced ? <Check size={17} /> : <Plus size={18} strokeWidth={2.5} />}
              </button>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
