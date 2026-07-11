import { AlertTriangle, ArrowRight, BarChart3, Lightbulb, RotateCcw } from "lucide-react";
import type { TripAnalysis } from "../domain";

type DuriAnalysisWorkspaceProps = {
  report: TripAnalysis;
  mode?: "compact" | "full";
};

export function DuriAnalysisWorkspace({ report, mode = "compact" }: DuriAnalysisWorkspaceProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[22px] font-black tracking-normal text-[#213D90]">두리 분석 리포트</h2>
        {mode === "compact" ? <button className="text-sm font-black text-[#4F86F7]">자세히</button> : null}
      </div>

      <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.14)]">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-[#E7F1FF] text-[#4F86F7]">
            <BarChart3 size={28} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xs font-black text-[#94B8EA]">취향 일치도</p>
            <p className="mt-1 text-[34px] font-black leading-none tracking-normal text-[#213D90]">{report.matchRate}%</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <ChipRow label="공통 선호" items={report.commonPreferences} tone="green" />
          <ChipRow label="조율 필요" items={report.needsTune} tone="sand" />
        </div>

        <div className="mt-4 space-y-2">
          <AnalysisNotice icon={AlertTriangle} text={report.routeWarning} />
          <AnalysisNotice icon={Lightbulb} text={report.unplannedCandidateMessage} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <button className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#4F86F7] text-[14px] font-black text-white transition hover:bg-[#3F73E8]">
            두리 제안 받기
            <ArrowRight size={17} strokeWidth={2.4} />
          </button>
          {mode === "full" ? (
            <button className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#EEF5FF] text-[14px] font-black text-[#2442B7] transition hover:bg-[#E2EEFF]">
              <RotateCcw size={16} />
              추천 순서로 재배치
            </button>
          ) : null}
        </div>
      </article>
    </section>
  );
}

function ChipRow({ label, items, tone }: { label: string; items: string[]; tone: "green" | "sand" }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black text-[#94B8EA]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
              tone === "green" ? "bg-[#E6F1FF] text-[#2442B7]" : "bg-[#FFF0CE] text-[#8A6614]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalysisNotice({ icon: Icon, text }: { icon: typeof AlertTriangle; text: string }) {
  return (
    <p className="flex gap-2 rounded-[18px] bg-[#F6FAFF] px-3 py-2.5 text-[12px] font-bold leading-5 text-[#6F8AC2]">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#4F86F7]" />
      {text}
    </p>
  );
}
