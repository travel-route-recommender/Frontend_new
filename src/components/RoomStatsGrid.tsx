import type { SummaryStat } from "../data/roomHome";

type RoomStatsGridProps = {
  stats: SummaryStat[];
};

export function RoomStatsGrid({ stats }: RoomStatsGridProps) {
  return (
    <section>
      <SectionHeader title="현재 여행 요약" />
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <article key={stat.label} className="min-h-[108px] rounded-lg border border-duri-line bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-duri-muted">{stat.label}</p>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-duri-mint text-duri-green-dark">
                <stat.icon size={17} strokeWidth={2.3} />
              </span>
            </div>
            <p className="mt-3 text-[24px] font-extrabold leading-none tracking-normal text-duri-ink">{stat.value}</p>
            <p className="mt-2 text-xs font-semibold leading-4 text-duri-muted">{stat.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">{title}</h2>
    </div>
  );
}
