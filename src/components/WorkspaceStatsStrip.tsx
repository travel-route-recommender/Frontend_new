type WorkspaceStatsStripProps = {
  metrics: Array<{ label: string; value: string }>;
  highlightLabel?: string;
};

export function WorkspaceStatsStrip({ metrics, highlightLabel }: WorkspaceStatsStripProps) {
  return (
    <section className="grid grid-cols-4 gap-2">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className={`rounded-[18px] px-2 py-3 text-center shadow-[0_8px_16px_rgba(91,129,190,0.12)] transition ${
            highlightLabel === metric.label ? "bg-[#DCEBFF] ring-2 ring-[#4F86F7]" : "bg-white"
          }`}
        >
          <p className="text-[11px] font-black leading-tight text-[#8BAFE4]">{metric.label}</p>
          <p className="mt-1 text-[18px] font-black leading-none text-[#213D90]">{metric.value}</p>
        </article>
      ))}
    </section>
  );
}
