import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Clock3, MapPinned, Salad, Sparkles, UsersRound } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { AnalysisCategory, AnalysisIssue, AnalysisStatus, CategoryAnalysisResult, DuriAnalysisResult } from "../features/duri-analysis";

type DuriAnalysisWorkspaceProps = {
  report: DuriAnalysisResult;
  mode?: "compact" | "full";
  onViewIssue?: (issue: AnalysisIssue) => void;
  onOpenCandidates?: () => void;
};

const categoryMeta: Record<AnalysisCategory, { label: string; icon: LucideIcon }> = {
  route: { label: "동선", icon: MapPinned },
  density: { label: "일정 밀도", icon: Clock3 },
  meal: { label: "식사", icon: Salad },
  preference: { label: "동행자 선호", icon: UsersRound },
};

const statusMeta: Record<AnalysisStatus, { label: string; className: string; icon: LucideIcon }> = {
  good: { label: "좋아요", className: "bg-[#E7F4EE] text-[#39836E]", icon: CheckCircle2 },
  attention: { label: "조율해 보세요", className: "bg-[#FFF3D8] text-[#8A6614]", icon: AlertTriangle },
  warning: { label: "주의가 필요해요", className: "bg-[#FFE8EA] text-[#C8515C]", icon: AlertTriangle },
  "insufficient-data": { label: "데이터가 더 필요해요", className: "bg-[#EEF4FC] text-[#7595C4]", icon: Sparkles },
};

export function DuriAnalysisWorkspace({ report, mode = "compact", onViewIssue, onOpenCandidates }: DuriAnalysisWorkspaceProps) {
  const [expandedCategories, setExpandedCategories] = useState<AnalysisCategory[]>(mode === "full" ? ["route", "density", "meal", "preference"] : []);
  const overall = statusMeta[report.overallStatus];
  const OverallIcon = overall.icon;
  const categories = [report.route, report.density, report.meal, report.preference];

  if (!report.analyzedItemCount) {
    return (
      <section>
        <h2 className="mb-3 text-[22px] font-black text-[#213D90]">두리 분석 리포트</h2>
        <div className="rounded-[28px] bg-white px-5 py-8 text-center shadow-[0_10px_22px_rgba(91,129,190,0.14)]">
          <Sparkles size={28} className="mx-auto text-[#7FADED]" />
          <h3 className="mt-3 text-[17px] font-black text-[#213D90]">일정을 추가하면 두리가 분석해드려요</h3>
          <p className="mt-2 text-[12px] font-bold leading-5 text-[#7898CE]">동선, 일정 밀도, 식사 시간과 동행자 선호 균형을 현재 일정에서 계산해요.</p>
          {onOpenCandidates ? <button type="button" onClick={onOpenCandidates} className="mt-5 h-11 rounded-[17px] bg-[#4388FF] px-5 text-[13px] font-black text-white">후보 장소에서 일정 만들기</button> : null}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[22px] font-black tracking-normal text-[#213D90]">두리 분석 리포트</h2>
        <span className="text-[11px] font-black text-[#8BAFE4]">일정 변경 시 자동 갱신</span>
      </div>

      <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_22px_rgba(91,129,190,0.14)]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#E7F1FF] p-3 text-[#4F86F7]"><OverallIcon size={23} /></div>
          <div className="min-w-0 flex-1">
            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${overall.className}`}>{overall.label}</span>
            <p className="mt-2 text-[14px] font-black leading-6 text-[#213D90]">{report.overallMessage}</p>
            <p className="mt-1 text-[11px] font-bold text-[#8BAFE4]">일정 {report.analyzedItemCount}개 분석</p>
          </div>
        </div>
      </article>

      <div className="mt-3 space-y-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.category}
            result={category}
            expanded={expandedCategories.includes(category.category)}
            onToggle={() => setExpandedCategories((current) => current.includes(category.category) ? current.filter((entry) => entry !== category.category) : [...current, category.category])}
            onViewIssue={onViewIssue}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ result, expanded, onToggle, onViewIssue }: { result: CategoryAnalysisResult; expanded: boolean; onToggle: () => void; onViewIssue?: (issue: AnalysisIssue) => void }) {
  const meta = categoryMeta[result.category];
  const status = statusMeta[result.status];
  const Icon = meta.icon;
  const StatusIcon = status.icon;
  const actionableCount = result.issues.filter((issue) => issue.severity !== "info").length;
  const evidence = result.issues.flatMap((issue) => issue.evidence).slice(0, 3);

  return (
    <article className="rounded-[24px] bg-white p-4 shadow-[0_8px_18px_rgba(91,129,190,0.11)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] bg-[#EEF5FF] text-[#4F86F7]"><Icon size={18} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-black text-[#213D90]">{meta.label}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black ${status.className}`}><StatusIcon size={10} />{status.label}</span>
          </div>
          <p className="mt-2 text-[12px] font-bold leading-5 text-[#6F8AC2]">{result.summary}</p>
        </div>
      </div>

      {evidence.length ? <div className="mt-3 flex flex-wrap gap-2">{evidence.map((entry, index) => <span key={`${entry.label}-${index}`} className="rounded-full bg-[#F2F7FF] px-2.5 py-1.5 text-[9px] font-black text-[#7197CF]">{entry.label} {entry.value}</span>)}</div> : null}

      <button type="button" onClick={onToggle} className="mt-3 flex h-9 w-full items-center justify-between rounded-[14px] bg-[#F7FAFF] px-3 text-[10px] font-black text-[#6F95D0]">
        <span>{actionableCount ? `조율 이슈 ${actionableCount}개` : result.status === "insufficient-data" ? "분석 근거 부족" : "분석 근거 보기"}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded ? (
        <div className="mt-3 space-y-2">
          {result.issues.length ? result.issues.map((issue) => (
            <div key={issue.id} className="rounded-[16px] border border-[#E3EDFA] bg-[#FBFDFF] p-3">
              <p className="text-[11px] font-black text-[#243C8F]">{issue.title}</p>
              <p className="mt-1 text-[10px] font-bold leading-4 text-[#7898CE]">{issue.summary}</p>
              <div className="mt-2 space-y-1">{issue.evidence.slice(0, 3).map((entry, index) => <p key={`${entry.label}-${index}`} className="text-[9px] font-bold text-[#8CAADA]">· {entry.label}: {entry.value}</p>)}</div>
              {onViewIssue && issue.affectedItemIds.length ? <button type="button" onClick={() => onViewIssue(issue)} className="mt-3 flex items-center gap-1 text-[10px] font-black text-[#4388FF]">일정에서 보기<ArrowRight size={12} /></button> : null}
            </div>
          )) : <p className="rounded-[15px] bg-[#F7FAFF] px-3 py-4 text-center text-[10px] font-bold text-[#8CAADA]">현재 데이터로 표시할 세부 근거가 없어요.</p>}
        </div>
      ) : null}
    </article>
  );
}
