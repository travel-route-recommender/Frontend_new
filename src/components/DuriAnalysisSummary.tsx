import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type DuriAnalysisSummaryProps = {
  summary: {
    matchRate: number;
    commonPreferences: string[];
    needsTune: string[];
    suggestion: string;
  };
  to: string;
};

export function DuriAnalysisSummary({ summary, to }: DuriAnalysisSummaryProps) {
  return (
    <section>
      <SectionHeader title="두리 분석 요약" />
      <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.12)]">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-[#E7F1FF] text-[#4388FF]">
            <BarChart3 size={27} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#94B8EA]">취향 일치도</p>
            <p className="mt-1 text-[30px] font-black leading-none text-[#243C8F]">{summary.matchRate}%</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <PreferenceRow label="공통 선호" items={summary.commonPreferences} tone="blue" />
          <PreferenceRow label="조율 필요" items={summary.needsTune} tone="sand" />
        </div>

        <p className="mt-4 flex gap-2 rounded-[18px] bg-[#F6FAFF] px-3 py-3 text-[12px] font-bold leading-5 text-[#6F8AC2]">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-[#4388FF]" />
          {summary.suggestion}
        </p>

        <Link to={to} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[17px] bg-[#F1F6FF] text-[13px] font-black text-[#4388FF]">
          분석 자세히 보기
          <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </article>
    </section>
  );
}

function PreferenceRow({ label, items, tone }: { label: string; items: string[]; tone: "blue" | "sand" }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-black text-[#94B8EA]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${tone === "blue" ? "bg-[#E7F1FF] text-[#4388FF]" : "bg-[#FFF0CE] text-[#8A6614]"}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="mb-3 text-[20px] font-black text-[#243C8F]">{title}</h2>;
}
