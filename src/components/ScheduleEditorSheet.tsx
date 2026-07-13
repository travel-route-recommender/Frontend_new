import { CalendarDays, Clock3, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  MAX_EDIT_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  SLOT_MINUTES,
} from "../data/workspaceSchedule";
import type { ItineraryMutationResult } from "../store/useDuriStore";
import { useDialogBehavior } from "../hooks/useDialogBehavior";
import { formatDuration } from "../utils/formatters";
import { formatScheduleDate, getEndTime } from "../utils/schedule";

export type ScheduleEditorValue = {
  date: string;
  startTime: string;
  durationMinutes: number;
  note: string;
};

type ScheduleEditorSheetProps = {
  mode: "add" | "edit";
  title: string;
  subtitle?: string;
  tripDates: string[];
  initialValue: ScheduleEditorValue;
  onClose: () => void;
  onSave: (value: ScheduleEditorValue) => ItineraryMutationResult;
  onDelete?: () => ItineraryMutationResult;
};

const resultMessages: Partial<Record<ItineraryMutationResult, string>> = {
  overlap: "이미 일정이 있는 시간이에요.",
  "duplicate-place": "이미 일정에 배치된 장소예요.",
  "invalid-date": "여행 기간 안의 날짜를 선택해 주세요.",
  "invalid-time": "08:00부터 24:00 사이의 30분 단위 시간을 선택해 주세요.",
  "trip-not-editable": "완료된 여행방의 일정은 수정할 수 없어요.",
  "not-member": "이 여행방의 참여자만 일정을 수정할 수 있어요.",
};

export function ScheduleEditorSheet({
  mode,
  title,
  subtitle,
  tripDates,
  initialValue,
  onClose,
  onSave,
  onDelete,
}: ScheduleEditorSheetProps) {
  useDialogBehavior(onClose);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setError(undefined);
    setConfirmDelete(false);
  }, [initialValue]);

  const durationOptions = useMemo(() => {
    const values: number[] = [];
    for (let minutes = MIN_DURATION_MINUTES; minutes <= MAX_EDIT_DURATION_MINUTES; minutes += SLOT_MINUTES) values.push(minutes);
    return values;
  }, []);

  const save = () => {
    const result = onSave({ ...value, note: value.note.trim() });
    if (result === "success") {
      onClose();
      return;
    }
    setError(resultMessages[result] ?? "일정을 저장하지 못했어요. 입력값을 확인해 주세요.");
  };

  const remove = () => {
    if (!onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const result = onDelete();
    if (result === "success") {
      onClose();
      return;
    }
    setError(resultMessages[result] ?? "일정을 삭제하지 못했어요.");
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end bg-[#19336A]/30 backdrop-blur-[2px]">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="일정 편집 닫기" />
      <section role="dialog" aria-modal="true" aria-labelledby="schedule-editor-title" className="relative z-10 max-h-[86%] w-full overflow-y-auto rounded-t-[32px] bg-white px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_40px_rgba(36,60,143,0.22)] no-scrollbar">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F1F6FF] text-[#243C8F]" aria-label="일정 편집 닫기">
          <X size={18} />
        </button>
        <p className="text-[12px] font-black text-[#7FADED]">{mode === "add" ? "Add schedule" : "Edit schedule"}</p>
        <h2 id="schedule-editor-title" className="mt-1 pr-10 text-[23px] font-black text-[#243C8F]">{title}</h2>
        {subtitle ? <p className="mt-1 text-[12px] font-bold text-[#8CAADA]">{subtitle}</p> : null}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-[#6F95D0]"><CalendarDays size={15} />날짜</span>
            <select value={value.date} onChange={(event) => setValue((current) => ({ ...current, date: event.target.value }))} className="h-12 w-full rounded-[17px] border border-[#DCE9FA] bg-[#F7FAFF] px-4 text-[14px] font-black text-[#243C8F] outline-none focus:border-[#4388FF]">
              {tripDates.map((date, index) => {
                const label = formatScheduleDate(date, index);
                return <option key={date} value={date}>{label.dayLabel} · {label.dateLabel}</option>;
              })}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-[#6F95D0]"><Clock3 size={15} />시작 시간</span>
              <input type="time" min="08:00" max="23:30" step={1800} value={value.startTime} onChange={(event) => setValue((current) => ({ ...current, startTime: event.target.value }))} className="h-12 w-full rounded-[17px] border border-[#DCE9FA] bg-[#F7FAFF] px-3 text-[14px] font-black text-[#243C8F] outline-none focus:border-[#4388FF]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[12px] font-black text-[#6F95D0]">체류 시간</span>
              <select value={value.durationMinutes} onChange={(event) => setValue((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} className="h-12 w-full rounded-[17px] border border-[#DCE9FA] bg-[#F7FAFF] px-3 text-[14px] font-black text-[#243C8F] outline-none focus:border-[#4388FF]">
                {durationOptions.map((minutes) => <option key={minutes} value={minutes}>{formatDuration(minutes)}</option>)}
              </select>
            </label>
          </div>

          <div className="rounded-[18px] bg-[#EAF3FF] px-4 py-3 text-[13px] font-black text-[#4388FF]">
            {value.startTime} → {getEndTime(value.startTime, value.durationMinutes)} · {formatDuration(value.durationMinutes)}
          </div>

          <label className="block">
            <span className="mb-2 block text-[12px] font-black text-[#6F95D0]">메모 (선택)</span>
            <textarea value={value.note} onChange={(event) => setValue((current) => ({ ...current, note: event.target.value }))} rows={2} placeholder="예약 정보나 함께 볼 내용을 적어두세요." className="w-full resize-none rounded-[17px] border border-[#DCE9FA] bg-[#F7FAFF] px-4 py-3 text-[13px] font-bold text-[#243C8F] outline-none placeholder:text-[#A9BFDF] focus:border-[#4388FF]" />
          </label>
        </div>

        {error ? <p role="alert" className="mt-4 rounded-[16px] bg-[#FFF1F1] px-4 py-3 text-[12px] font-black text-[#D45A64]">{error}</p> : null}

        <div className={`mt-5 grid gap-3 ${onDelete ? "grid-cols-[0.8fr_1.4fr]" : "grid-cols-1"}`}>
          {onDelete ? (
            <button type="button" onClick={remove} className={`flex h-12 items-center justify-center gap-2 rounded-[18px] text-[13px] font-black ${confirmDelete ? "bg-[#E25B66] text-white" : "bg-[#FFF0F1] text-[#D95B66]"}`} aria-label={confirmDelete ? "일정 삭제 확인" : "일정 삭제"}>
              <Trash2 size={16} />{confirmDelete ? "한 번 더 눌러 삭제" : "삭제"}
            </button>
          ) : null}
          <button type="button" onClick={save} className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white shadow-[0_10px_20px_rgba(67,136,255,0.24)]">
            <Save size={17} />{mode === "add" ? "일정에 추가" : "변경 저장"}
          </button>
        </div>
      </section>
    </div>
  );
}
