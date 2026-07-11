import { Clock3, GripVertical, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import type { DayKey } from "../data/workspace";
import { formatDayLabel, formatDuration, formatTimeLabel } from "../utils/formatters";
import type { ItineraryView } from "./workspaceViewModels";

type ItineraryTimelineProps = {
  activeDay: DayKey;
  tripStartDate: string;
  items: ItineraryView[];
  onOpenCandidates: () => void;
  onRemoveItem: (itemId: string) => void;
};

export function ItineraryTimeline({ activeDay, tripStartDate, items, onOpenCandidates, onRemoveItem }: ItineraryTimelineProps) {
  const visibleDays: Exclude<DayKey, "전체">[] = activeDay === "전체" ? ["Day 1", "Day 2"] : [activeDay];
  return (
    <section className="space-y-4">
      {visibleDays.map((day) => {
        const dayItems = items.filter((view) => formatDayLabel(view.item.date, tripStartDate) === day);
        return (
          <article key={day} className="rounded-[30px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.14)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[#4F86F7]">{day}</p>
                <h2 className="mt-1 text-[21px] font-black leading-tight tracking-normal text-[#213D90]">{day === "Day 1" ? "카페, 산책, 바다 야경" : "남은 후보로 채울 일정"}</h2>
              </div>
              <button onClick={onOpenCandidates} className="flex h-11 items-center gap-1.5 rounded-[17px] bg-[#F0F6FF] px-4 text-xs font-black text-[#2442B7] transition hover:bg-[#E2EEFF]"><Plus size={15} />장소 추가</button>
            </div>
            <div className="mt-4 space-y-3">
              <AddSlot onClick={onOpenCandidates} label={`${day} 첫 일정에 추가`} />
              {dayItems.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#CFE1FF] bg-[#F8FBFF] px-4 py-6 text-center">
                  <p className="text-sm font-black text-[#213D90]">아직 배치된 장소가 없어요</p>
                  <p className="mt-1 text-xs font-bold text-[#8BAFE4]">아래 후보 장소에서 골라 넣을 수 있어요.</p>
                </div>
              ) : dayItems.map((view, index) => (
                <div key={view.item.id} className="relative">
                  <TimelinePlaceCard view={view} order={index + 1} onRemove={() => onRemoveItem(view.item.id)} />
                  <AddSlot onClick={onOpenCandidates} label={`${view.place?.name ?? "일정"} 다음에 추가`} />
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function TimelinePlaceCard({ view, order, onRemove }: { view: ItineraryView; order: number; onRemove: () => void }) {
  const { item, place, preferredByUsers } = view;
  const name = place?.name ?? item.note ?? "이동 일정";
  return (
    <div className="relative rounded-[24px] bg-[#F8FBFF] p-4">
      <div className="absolute left-[-9px] top-5 grid h-7 w-7 place-items-center rounded-full bg-[#4F86F7] text-[11px] font-black text-white ring-4 ring-white">{order}</div>
      <div className="flex gap-3">
        <button aria-label="순서 변경" className="mt-8 shrink-0 text-[#9ABBEA]"><GripVertical size={19} strokeWidth={2.3} /></button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2"><span className="rounded-full bg-[#E1EEFF] px-3 py-1 text-[11px] font-black text-[#4F86F7]">{formatTimeLabel(item.startTime)}</span><span className="text-[13px] font-black text-[#213D90]">{item.startTime}</span></div>
              <h3 className="mt-2 text-[19px] font-black leading-tight tracking-normal text-[#213D90]">{name}</h3>
            </div>
            <div className="flex shrink-0 gap-1">
              <button aria-label={`${name} 수정`} className="grid h-9 w-9 place-items-center rounded-[14px] bg-white text-[#8BAFE4]"><Pencil size={15} /></button>
              <button onClick={onRemove} aria-label={`${name} 삭제`} className="grid h-9 w-9 place-items-center rounded-[14px] bg-white text-[#8BAFE4]"><Trash2 size={15} /></button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#4F86F7] px-2.5 py-1 text-[11px] font-black text-white">{place?.category ?? item.itemType}</span>
            {place?.tags.map((tag) => <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#8BAFE4]">{tag}</span>)}
          </div>
          <div className="mt-3 grid gap-2 text-[12px] font-bold text-[#7CA4DE]">
            <p className="flex items-center gap-1.5"><Clock3 size={14} />예상 체류 {formatDuration(item.durationMinutes)}</p>
            <p className="flex items-center gap-1.5"><UserRound size={14} />선호 {preferredByUsers.map((user) => user.name).join(", ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSlot({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex h-11 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#CFE1FF] bg-white text-[13px] font-black text-[#4F86F7] transition hover:bg-[#F0F6FF]"><Plus size={16} strokeWidth={2.3} />{label}</button>;
}
