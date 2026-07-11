import { ArrowRight, Pencil, Route } from "lucide-react";
import type { DraftDay } from "../data/roomHome";

type DraftSchedulePreviewProps = {
  days: DraftDay[];
};

export function DraftSchedulePreview({ days }: DraftSchedulePreviewProps) {
  return (
    <section>
      <SectionHeader title="일정 초안 미리보기" action="전체 보기" />
      <div className="space-y-3">
        {days.map((day) => (
          <article key={day.day} className="rounded-lg border border-duri-line bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-duri-green-dark">{day.day}</p>
                <h3 className="mt-1 text-[16px] font-extrabold leading-snug tracking-normal text-duri-ink">{day.title}</h3>
              </div>
              <button className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-duri-bg px-3 text-xs font-extrabold text-duri-ink transition hover:bg-duri-mint">
                <Pencil size={14} />
                수정
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#F5F8F6] px-3 py-3 text-[13px] font-extrabold text-duri-ink">
              <Route size={17} className="shrink-0 text-duri-green-dark" />
              <span className="min-w-0 truncate">{day.route[0]}</span>
              <ArrowRight size={14} className="shrink-0 text-duri-muted" />
              <span className="min-w-0 truncate">{day.route[1]}</span>
            </div>

            <p className="mt-3 text-[12px] font-medium leading-5 text-duri-muted">{day.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">{title}</h2>
      {action ? <button className="text-sm font-bold text-duri-green-dark">{action}</button> : null}
    </div>
  );
}
