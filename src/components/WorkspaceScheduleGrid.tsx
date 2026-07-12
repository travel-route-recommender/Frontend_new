import { GripHorizontal, GripVertical, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import type { ItineraryItem } from "../domain";
import {
  MIN_DATE_COLUMN_WIDTH_PX,
  MIN_DURATION_MINUTES,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
  WORKSPACE_END_MINUTES,
  WORKSPACE_GRID_HEIGHT_PX,
  WORKSPACE_SLOT_COUNT,
  WORKSPACE_START_MINUTES,
} from "../data/workspaceSchedule";
import { formatDuration } from "../utils/formatters";
import {
  formatScheduleDate,
  getEndTime,
  getHeightFromDuration,
  getTopFromStartTime,
  minutesToTimeString,
  timeStringToMinutes,
} from "../utils/schedule";
import type { ItineraryView } from "./workspaceViewModels";
import type { WorkspaceDragData, WorkspaceDropData } from "./workspaceDnd";

type WorkspaceScheduleGridProps = {
  tripDates: string[];
  activeDate: string;
  items: ItineraryView[];
  collisionItemId?: string;
  highlightedItemIds?: string[];
  focusTarget?: { itemId: string; date: string; startTime: string; token: number };
  readOnly?: boolean;
  onSelectDate: (date: string) => void;
  onOpenItem: (view: ItineraryView) => void;
  onResizeItem: (item: ItineraryItem, durationMinutes: number) => void;
};

export function WorkspaceScheduleGrid({
  tripDates,
  activeDate,
  items,
  collisionItemId,
  highlightedItemIds = [],
  focusTarget,
  readOnly,
  onSelectDate,
  onOpenItem,
  onResizeItem,
}: WorkspaceScheduleGridProps) {
  const gridTemplateColumns = `52px repeat(${Math.max(tripDates.length, 1)}, minmax(${MIN_DATE_COLUMN_WIDTH_PX}px, 1fr))`;
  const minWidth = 52 + Math.max(tripDates.length, 1) * MIN_DATE_COLUMN_WIDTH_PX;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!focusTarget || !scrollRef.current) return;
    const dateIndex = tripDates.indexOf(focusTarget.date);
    scrollRef.current.scrollTo({
      top: Math.max(getTopFromStartTime(focusTarget.startTime) - 80, 0),
      left: dateIndex > 0 ? Math.max(52 + dateIndex * MIN_DATE_COLUMN_WIDTH_PX - 40, 0) : 0,
      behavior: "smooth",
    });
  }, [focusTarget, tripDates]);

  return (
    <section className="flex h-full min-h-[390px] flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_10px_24px_rgba(91,129,190,0.14)]" aria-label="여행 일정 시간표">
      <div className="border-b border-[#DFEAF9] px-4 py-3">
        <p className="text-[11px] font-black text-[#7FADED]">08:00–24:00 · 30분 단위</p>
        <p className="mt-1 text-[12px] font-bold text-[#8CAADA]">이동 핸들을 길게 누르거나 블록을 눌러 편집하세요.</p>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto overscroll-contain" data-testid="workspace-schedule-scroll">
        <div style={{ minWidth }}>
          <div className="sticky top-0 z-30 grid h-[60px] border-b border-[#DCE9FA] bg-white/96 backdrop-blur" style={{ gridTemplateColumns }}>
            <div className="sticky left-0 z-40 grid place-items-center border-r border-[#E1EBF9] bg-white text-[10px] font-black text-[#9AB7DB]">시간</div>
            {tripDates.map((date, index) => {
              const label = formatScheduleDate(date, index);
              const selected = date === activeDate;
              return (
                <button key={date} type="button" onClick={() => onSelectDate(date)} className={`border-r border-[#E1EBF9] px-2 text-center transition ${selected ? "bg-[#EAF3FF] text-[#4388FF]" : "bg-white text-[#7E9CCB]"}`}>
                  <span className="block text-[11px] font-black">{label.dayLabel}</span>
                  <span className="mt-1 block text-[12px] font-black">{label.dateLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="relative grid" style={{ gridTemplateColumns, height: WORKSPACE_GRID_HEIGHT_PX + 120 }}>
            <TimeAxis />
            {tripDates.map((date) => (
              <ScheduleDayColumn
                key={date}
                date={date}
                active={date === activeDate}
                views={items.filter((view) => view.item.date === date)}
                collisionItemId={collisionItemId}
                highlightedItemIds={highlightedItemIds}
                readOnly={readOnly}
                onOpenItem={onOpenItem}
                onResizeItem={onResizeItem}
              />
            ))}
            {!items.length ? (
              <div className="pointer-events-none absolute left-[64px] top-4 z-20 rounded-[16px] border border-dashed border-[#BFD7F7] bg-white/94 px-4 py-3 text-[11px] font-black text-[#6F95D0] shadow-sm">
                아래 후보 장소를 끌어 일정에 배치해보세요.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeAxis() {
  const hours = Array.from({ length: 17 }, (_, index) => 8 + index);
  return (
    <div className="sticky left-0 z-20 border-r border-[#DCE9FA] bg-white" style={{ height: WORKSPACE_GRID_HEIGHT_PX }}>
      {hours.map((hour) => {
        const top = ((hour * 60 - WORKSPACE_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
        return <span key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-black text-[#9AB7DB]" style={{ top }}>{minutesToTimeString(hour * 60)}</span>;
      })}
    </div>
  );
}

function ScheduleDayColumn({
  date,
  active,
  views,
  collisionItemId,
  highlightedItemIds,
  readOnly,
  onOpenItem,
  onResizeItem,
}: {
  date: string;
  active: boolean;
  views: ItineraryView[];
  collisionItemId?: string;
  highlightedItemIds: string[];
  readOnly?: boolean;
  onOpenItem: (view: ItineraryView) => void;
  onResizeItem: (item: ItineraryItem, durationMinutes: number) => void;
}) {
  return (
    <div className={`relative border-r border-[#DCE9FA] ${active ? "bg-[#F8FBFF]" : "bg-white"}`} style={{ height: WORKSPACE_GRID_HEIGHT_PX }} data-date={date}>
      {Array.from({ length: WORKSPACE_SLOT_COUNT }, (_, index) => (
        <ScheduleSlot key={index} date={date} slotIndex={index} />
      ))}
      {views.map((view) => (
        <ScheduleItemBlock
          key={view.item.id}
          view={view}
          collision={collisionItemId === view.item.id}
          highlighted={highlightedItemIds.includes(view.item.id)}
          readOnly={readOnly}
          onOpen={() => onOpenItem(view)}
          onResize={(duration) => onResizeItem(view.item, duration)}
        />
      ))}
    </div>
  );
}

function ScheduleSlot({ date, slotIndex }: { date: string; slotIndex: number }) {
  const startMinutes = WORKSPACE_START_MINUTES + slotIndex * SLOT_MINUTES;
  const startTime = minutesToTimeString(startMinutes);
  const data: WorkspaceDropData = { kind: "slot", date, startTime };
  const { ref, isDropTarget } = useDroppable<WorkspaceDropData>({
    id: `slot:${date}:${startTime}`,
    data,
    type: "schedule-slot",
    accept: ["candidate", "itinerary"],
  });
  const major = startMinutes % 60 === 0;
  return (
    <div
      ref={ref}
      className={`absolute inset-x-0 border-t ${major ? "border-[#CADCF3]" : "border-dashed border-[#E5EEF9]"} ${isDropTarget ? "z-10 bg-[#BFD9FF]/70 ring-2 ring-inset ring-[#4388FF]" : ""}`}
      style={{ top: slotIndex * SLOT_HEIGHT_PX, height: SLOT_HEIGHT_PX }}
      aria-label={`${date} ${startTime} 드롭 영역`}
    />
  );
}

function ScheduleItemBlock({
  view,
  collision,
  highlighted,
  readOnly,
  onOpen,
  onResize,
}: {
  view: ItineraryView;
  collision: boolean;
  highlighted: boolean;
  readOnly?: boolean;
  onOpen: () => void;
  onResize: (durationMinutes: number) => void;
}) {
  const { item, place, preferredByUsers } = view;
  const name = place?.name ?? item.note ?? item.itemType;
  const data: WorkspaceDragData = { kind: "itinerary", itemId: item.id, name };
  const { ref, handleRef, isDragging } = useDraggable<WorkspaceDragData>({
    id: `itinerary:${item.id}`,
    data,
    type: "itinerary",
    disabled: readOnly,
  });
  const [previewDuration, setPreviewDuration] = useState<number>();
  const previewDurationRef = useRef(item.durationMinutes);
  const resizeRef = useRef<{ pointerId: number; startY: number; startDuration: number } | undefined>(undefined);
  const duration = previewDuration ?? item.durationMinutes;
  const blockHeight = Math.max(getHeightFromDuration(duration) - 4, 32);
  const compact = duration <= MIN_DURATION_MINUTES;

  const resizeMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const slotDelta = Math.round((event.clientY - state.startY) / SLOT_HEIGHT_PX);
    const maxDuration = WORKSPACE_END_MINUTES - timeStringToMinutes(item.startTime);
    const next = Math.min(Math.max(state.startDuration + slotDelta * SLOT_MINUTES, MIN_DURATION_MINUTES), maxDuration);
    previewDurationRef.current = next;
    setPreviewDuration(next);
  };

  const resizeEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    resizeRef.current = undefined;
    const next = previewDurationRef.current;
    setPreviewDuration(undefined);
    if (next !== item.durationMinutes) onResize(next);
  };

  return (
    <div
      ref={ref}
      className={`absolute inset-x-1.5 z-20 overflow-hidden rounded-[13px] border bg-[#E7F1FF] text-[#2442B7] shadow-[0_5px_12px_rgba(67,136,255,0.18)] transition-all ${collision ? "animate-pulse border-[#E05A66] ring-2 ring-[#E05A66]/30" : highlighted ? "animate-pulse border-[#4388FF] ring-4 ring-[#4388FF]/30" : "border-[#AFCDF7]"} ${isDragging ? "opacity-35" : "opacity-100"}`}
      style={{ top: getTopFromStartTime(item.startTime) + 2, height: blockHeight }}
      aria-label={`${name}, ${item.date} ${item.startTime}부터 ${getEndTime(item.startTime, duration)}까지`}
    >
      <button type="button" onClick={onOpen} className="h-full w-full px-2 pb-3 pr-7 pt-1.5 text-left" aria-label={`${name} 일정 편집`}>
        <span className="block truncate text-[11px] font-black leading-tight">{name}</span>
        <span className="mt-0.5 block text-[9px] font-black text-[#5E8ED8]">{item.startTime}{compact ? "" : `–${getEndTime(item.startTime, duration)}`}</span>
        {!compact ? <span className="mt-1 flex items-center gap-1 truncate text-[8px] font-bold text-[#78A0D9]"><UserRound size={9} />{preferredByUsers.map((user) => user.initial).join(" · ") || formatDuration(duration)}</span> : null}
      </button>
      {!readOnly ? (
        <button ref={handleRef} type="button" aria-label={`${name} 일정 이동`} className="absolute right-1 top-1 grid h-6 w-6 touch-none place-items-center rounded-[8px] bg-white/80 text-[#6E9EDC] active:scale-95">
          <GripVertical size={13} />
        </button>
      ) : null}
      {!readOnly ? (
        <button
          type="button"
          aria-label={`${name} 체류시간 조절`}
          className="absolute inset-x-1 bottom-0 grid h-3 touch-none place-items-center rounded-full text-[#6E9EDC]"
          onPointerDown={(event) => {
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startDuration: item.durationMinutes };
            previewDurationRef.current = item.durationMinutes;
            setPreviewDuration(item.durationMinutes);
          }}
          onPointerMove={resizeMove}
          onPointerUp={resizeEnd}
          onPointerCancel={() => {
            resizeRef.current = undefined;
            setPreviewDuration(undefined);
          }}
        >
          <GripHorizontal size={13} />
        </button>
      ) : null}
      {previewDuration ? <span className="absolute bottom-3 left-1 rounded bg-[#2442B7] px-1.5 py-0.5 text-[8px] font-black text-white">{getEndTime(item.startTime, previewDuration)} · {formatDuration(previewDuration)}</span> : null}
    </div>
  );
}
