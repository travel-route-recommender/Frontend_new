import { ArrowRight, Sparkles } from "lucide-react";

type RoomProgressCardProps = {
  summary: {
    percent: number;
    label: string;
    message: string;
    cta: string;
  };
};

export function RoomProgressCard({ summary }: RoomProgressCardProps) {
  return (
    <article className="rounded-lg border border-duri-line bg-[#FDFEFC] p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-duri-green-dark">여행 준비 진행률</p>
          <h2 className="mt-1 text-[21px] font-extrabold leading-tight tracking-normal">{summary.label}</h2>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-duri-mint text-duri-green-dark">
          <Sparkles size={21} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-extrabold text-duri-muted">
          <span>전체 흐름</span>
          <span>{summary.percent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E6ECE7]">
          <div className="h-full rounded-full bg-duri-green" style={{ width: `${summary.percent}%` }} />
        </div>
      </div>

      <p className="mt-4 text-[14px] font-medium leading-6 text-duri-muted">{summary.message}</p>

      <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-duri-green text-[15px] font-extrabold text-white transition hover:bg-duri-green-dark">
        {summary.cta}
        <ArrowRight size={18} strokeWidth={2.4} />
      </button>
    </article>
  );
}
