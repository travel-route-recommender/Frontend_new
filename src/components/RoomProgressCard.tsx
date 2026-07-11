import { ArrowRight, Check, Circle, LoaderCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export type RoomProgressStep = {
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
};

type RoomProgressCardProps = {
  summary: {
    percent: number;
    label: string;
    message: string;
    cta: string;
  };
  steps: RoomProgressStep[];
  to: string;
};

export function RoomProgressCard({ summary, steps, to }: RoomProgressCardProps) {
  const percent = Math.min(Math.max(summary.percent, 0), 100);

  return (
    <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-black text-[#4F86F7]">여행 준비 진행률</p>
          <h2 className="mt-1 text-[20px] font-black leading-tight text-[#243C8F]">{summary.label}</h2>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[17px] bg-[#E7F1FF] text-[#4388FF]">
          <Sparkles size={21} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-black text-[#8BAFE4]">
          <span>전체 흐름</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E6EFFC]">
          <div className="h-full rounded-full bg-[#4388FF] transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <p className="mt-4 text-[13px] font-bold leading-5 text-[#6F8AC2]">{summary.message}</p>

      <div className="mt-4 space-y-2 border-t border-[#E4EDFA] pt-4">
        {steps.map((step) => {
          const Icon = step.status === "completed" ? Check : step.status === "active" ? LoaderCircle : Circle;
          return (
            <div key={step.title} className="flex items-start gap-3 rounded-[17px] bg-[#F7FAFF] px-3 py-3">
              <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                step.status === "completed"
                  ? "bg-[#4388FF] text-white"
                  : step.status === "active"
                    ? "bg-[#DCEBFF] text-[#4388FF]"
                    : "bg-white text-[#B0C6E5]"
              }`}>
                <Icon size={14} className={step.status === "active" ? "animate-spin" : ""} />
              </span>
              <div>
                <p className="text-[12px] font-black text-[#243C8F]">{step.title}</p>
                <p className="mt-0.5 text-[11px] font-bold leading-4 text-[#8CAADA]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Link to={to} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white shadow-[0_8px_16px_rgba(67,136,255,0.2)]">
        {summary.cta}
        <ArrowRight size={17} strokeWidth={2.4} />
      </Link>
    </article>
  );
}
