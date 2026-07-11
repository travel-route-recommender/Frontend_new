import { ArrowRight, BarChart3 } from "lucide-react";

type DuriTestCardProps = {
  summary: {
    type: string;
    description: string;
    traits: string[];
  };
};

export function DuriTestCard({ summary }: DuriTestCardProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">두리 테스트</h2>
        <button className="text-sm font-bold text-duri-green-dark">동행자와 비교</button>
      </div>

      <article className="rounded-[24px] border border-duri-line bg-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E2F0F3] text-duri-blue">
            <BarChart3 size={23} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-duri-muted">내 여행 성향</p>
            <h2 className="mt-1 text-[21px] font-extrabold leading-tight tracking-normal text-duri-ink">
              {summary.type}
            </h2>
            <p className="mt-2 text-[14px] font-medium leading-6 text-duri-muted">{summary.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {summary.traits.map((trait) => (
            <span key={trait} className="rounded-full bg-duri-bg px-3 py-1.5 text-xs font-bold text-duri-green-dark">
              {trait}
            </span>
          ))}
        </div>

        <button className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#F1F5F2] text-[14px] font-extrabold text-duri-ink transition hover:bg-duri-mint">
          테스트 다시 보기
          <ArrowRight size={17} strokeWidth={2.3} />
        </button>
      </article>
    </section>
  );
}
