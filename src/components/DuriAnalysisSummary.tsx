import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { DuriAnalysisResult } from "../features/duri-analysis";

type DuriAnalysisSummaryProps = {
  summary: DuriAnalysisResult;
  to: string;
};

const statusLabels = {
  good: "전반적으로 좋아요",
  attention: "조율 포인트가 있어요",
  warning: "우선 확인할 부분이 있어요",
  "insufficient-data": "일정이 더 필요해요",
} as const;

export function DuriAnalysisSummary({ summary, to }: DuriAnalysisSummaryProps) {
  const categories = [summary.route, summary.density, summary.meal, summary.preference];
  const attentionLabels = ["동선", "밀도", "식사", "선호"].filter((_, index) => categories[index].status === "attention" || categories[index].status === "warning");
  return (
    <section>
      <h2 className="mb-3 text-[20px] font-black text-[#243C8F]">두리 분석 요약</h2>
      <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.12)]">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-[#E7F1FF] text-[#4388FF]"><BarChart3 size={27} /></div>
          <div>
            <p className="text-[11px] font-black text-[#94B8EA]">현재 일정 {summary.analyzedItemCount}개 분석</p>
            <p className="mt-1 text-[18px] font-black text-[#243C8F]">{statusLabels[summary.overallStatus]}</p>
          </div>
        </div>
        <p className="mt-4 flex gap-2 rounded-[18px] bg-[#F6FAFF] px-3 py-3 text-[12px] font-bold leading-5 text-[#6F8AC2]"><Sparkles size={16} className="mt-0.5 shrink-0 text-[#4388FF]" />{summary.overallMessage}</p>
        {attentionLabels.length ? <p className="mt-3 text-[11px] font-black text-[#8A6614]">확인할 영역 · {attentionLabels.join(" · ")}</p> : null}
        <Link to={to} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[17px] bg-[#F1F6FF] text-[13px] font-black text-[#4388FF]">분석 자세히 보기<ArrowRight size={16} /></Link>
      </article>
    </section>
  );
}
