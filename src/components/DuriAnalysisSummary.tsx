import { ArrowRight, BarChart3 } from "lucide-react";

type DuriAnalysisSummaryProps = {
  summary: {
    matchRate: number;
    commonPreferences: string[];
    needsTune: string[];
  };
};

export function DuriAnalysisSummary({ summary }: DuriAnalysisSummaryProps) {
  return (
    <section>
      <SectionHeader title="두리 분석 요약" />
      <article className="rounded-lg border border-duri-line bg-white p-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[#E2F0F3] text-duri-blue">
            <BarChart3 size={27} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xs font-bold text-duri-muted">취향 일치도</p>
            <p className="mt-1 text-[30px] font-extrabold leading-none tracking-normal text-duri-ink">
              {summary.matchRate}%
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <PreferenceRow label="공통 선호" items={summary.commonPreferences} tone="green" />
          <PreferenceRow label="조율 필요" items={summary.needsTune} tone="sand" />
        </div>

        <button className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F1F5F2] text-[14px] font-extrabold text-duri-ink transition hover:bg-duri-mint">
          분석 자세히 보기
          <ArrowRight size={17} strokeWidth={2.4} />
        </button>
      </article>
    </section>
  );
}

function PreferenceRow({ label, items, tone }: { label: string; items: string[]; tone: "green" | "sand" }) {
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold text-duri-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
              tone === "green" ? "bg-duri-mint text-duri-green-dark" : "bg-duri-sand text-[#745A24]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">{title}</h2>
    </div>
  );
}
