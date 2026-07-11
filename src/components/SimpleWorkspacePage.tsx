import { ArrowRight, Compass, MapPinned, Plus, Route, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

type SimpleWorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  icon: "trip" | "duri" | "saved" | "profile";
  primaryTo: string;
  stats?: Array<[string, string]>;
  itineraryLines?: string[];
};

export function SimpleWorkspacePage({
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  icon,
  primaryTo,
  stats,
  itineraryLines,
}: SimpleWorkspacePageProps) {
  const Icon = icon === "trip" ? Users : icon === "duri" ? Sparkles : icon === "saved" ? MapPinned : Compass;

  return (
    <div className="px-5 pb-32 pt-2">
      <section className="overflow-hidden rounded-[32px] bg-white shadow-[0_12px_26px_rgba(79,134,247,0.12)]">
        <div className="relative bg-[#4388FF] px-5 py-7 text-white">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/14" />
          <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-white/18 backdrop-blur">
            <Icon size={31} />
          </div>
          <p className="mt-5 text-[13px] font-black text-[#D6E8FF]">{eyebrow}</p>
          <h1 className="mt-1 text-[28px] font-black leading-tight">{title}</h1>
          <p className="mt-3 text-[14px] font-bold leading-6 text-[#DDEBFF]">{description}</p>
        </div>
        <div className="space-y-3 px-5 py-5">
          <Link
            to={primaryTo}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-[#243C8F] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(36,60,143,0.22)]"
          >
            {primaryLabel}
            <ArrowRight size={18} />
          </Link>
          <button
            type="button"
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-[#F1F6FF] text-[15px] font-black text-[#4388FF]"
          >
            <Plus size={18} />
            {secondaryLabel}
          </button>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {(stats ?? []).map(([label, value]) => (
          <div key={label} className="rounded-[22px] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
            <p className="text-[12px] font-black text-[#9CB7DD]">{label}</p>
            <p className="mt-1 text-[22px] font-black text-[#243C8F]">{value}</p>
          </div>
        ))}
      </section>

      {itineraryLines?.length ? <section className="mt-5 rounded-[24px] bg-white p-4 shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#EAF3FF] text-[#4388FF]">
            <Route size={22} />
          </span>
          <div>
            {itineraryLines.map((line, index) => <p key={line} className={index === 0 ? "text-[13px] font-black text-[#243C8F]" : "mt-0.5 text-[12px] font-bold text-[#88A8D8]"}>{line}</p>)}
          </div>
        </div>
      </section> : null}
    </div>
  );
}
