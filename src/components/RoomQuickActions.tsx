import type { RoomQuickAction } from "../data/roomHome";

type RoomQuickActionsProps = {
  actions: RoomQuickAction[];
};

export function RoomQuickActions({ actions }: RoomQuickActionsProps) {
  return (
    <section>
      <SectionHeader title="빠른 실행" />
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`min-h-[96px] rounded-lg border p-4 text-left shadow-card transition active:scale-[0.98] ${
              action.primary
                ? "border-duri-green bg-duri-green text-white"
                : "border-duri-line bg-white text-duri-ink hover:bg-[#FBFCFA]"
            }`}
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-lg ${
                action.primary ? "bg-white/18 text-white ring-1 ring-white/25" : "bg-duri-bg text-duri-green-dark"
              }`}
            >
              <action.icon size={19} strokeWidth={2.3} />
            </span>
            <span className="mt-3 block text-[14px] font-extrabold leading-snug tracking-normal">{action.label}</span>
            <span className={`mt-1 block text-xs font-semibold ${action.primary ? "text-white/78" : "text-duri-muted"}`}>
              {action.description}
            </span>
          </button>
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
