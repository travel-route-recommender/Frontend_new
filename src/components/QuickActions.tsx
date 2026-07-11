import type { QuickAction } from "../data/home";

type QuickActionsProps = {
  actions: QuickAction[];
};

const actionTone = {
  green: "bg-duri-green text-white",
  blue: "bg-[#E2F0F3] text-duri-blue",
  sand: "bg-duri-sand text-[#7C5C22]",
  white: "bg-white text-duri-ink",
};

const iconTone = {
  green: "bg-white/18 text-white ring-1 ring-white/25",
  blue: "bg-white text-duri-blue",
  sand: "bg-white text-[#7C5C22]",
  white: "bg-duri-mint text-duri-green-dark",
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section>
      <SectionTitle title="빠른 실행" action="모두 보기" />
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`min-h-[114px] rounded-[22px] p-4 text-left shadow-card transition active:scale-[0.98] ${actionTone[action.tone]}`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-2xl ${iconTone[action.tone]}`}>
              <action.icon size={20} strokeWidth={2.3} />
            </span>
            <span className="mt-3 block text-[15px] font-extrabold leading-snug tracking-normal">{action.label}</span>
            <span
              className={`mt-1 block text-xs font-semibold leading-snug ${
                action.tone === "green" ? "text-white/78" : "text-duri-muted"
              }`}
            >
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

type SectionTitleProps = {
  title: string;
  action?: string;
};

function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">{title}</h2>
      {action ? <button className="text-sm font-bold text-duri-green-dark">{action}</button> : null}
    </div>
  );
}
