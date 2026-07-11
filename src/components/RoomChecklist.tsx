import { Check, Circle, Clock } from "lucide-react";
import type { PreparationStep } from "../data/roomHome";

type RoomChecklistProps = {
  steps: PreparationStep[];
};

const statusStyle = {
  done: {
    icon: Check,
    dot: "bg-duri-green text-white",
    badge: "bg-duri-mint text-duri-green-dark",
    title: "text-duri-ink",
  },
  active: {
    icon: Clock,
    dot: "bg-[#E2F0F3] text-duri-blue",
    badge: "bg-[#E2F0F3] text-duri-blue",
    title: "text-duri-ink",
  },
  pending: {
    icon: Circle,
    dot: "bg-duri-bg text-duri-muted",
    badge: "bg-duri-bg text-duri-muted",
    title: "text-duri-muted",
  },
};

export function RoomChecklist({ steps }: RoomChecklistProps) {
  return (
    <section>
      <SectionHeader title="여행 준비 단계" action="흐름 보기" />
      <div className="overflow-hidden rounded-lg border border-duri-line bg-white shadow-card">
        {steps.map((step, index) => {
          const style = statusStyle[step.status];
          const Icon = style.icon;

          return (
            <div key={step.title} className="flex gap-3 border-b border-duri-line px-4 py-3.5 last:border-b-0">
              <div className="flex flex-col items-center">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${style.dot}`}>
                  <Icon size={16} strokeWidth={2.4} />
                </span>
                {index < steps.length - 1 ? <span className="mt-2 h-7 w-px bg-duri-line" /> : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-[14px] font-extrabold leading-snug ${style.title}`}>{step.title}</h3>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${style.badge}`}>
                    {step.statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-[12px] font-medium leading-5 text-duri-muted">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">{title}</h2>
      {action ? <button className="text-sm font-bold text-duri-green-dark">{action}</button> : null}
    </div>
  );
}
