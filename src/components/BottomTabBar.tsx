import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export type BottomTab = {
  label: string;
  icon: LucideIcon;
  to: string;
  active?: boolean;
};

type BottomTabBarProps = {
  tabs: BottomTab[];
  variant?: "default" | "compact";
};

export function BottomTabBar({ tabs, variant = "default" }: BottomTabBarProps) {
  const isCompact = variant === "compact";

  return (
    <nav
      className={`fixed left-1/2 z-20 w-[calc(100%-28px)] max-w-[402px] -translate-x-1/2 rounded-[34px] bg-white/98 px-4 shadow-[0_12px_28px_rgba(91,129,190,0.24)] backdrop-blur ${
        isCompact ? "bottom-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2" : "bottom-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3"
      }`}
    >
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            to={tab.to}
            aria-current={tab.active ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-black transition ${
              isCompact ? "min-h-[58px]" : "min-h-[64px]"
            } ${tab.active ? "text-[#4F86F7]" : "text-[#B6D3F8]"}`}
          >
            <span
              className={`grid place-items-center rounded-full transition ${
                tab.active
                  ? "-mt-8 h-[58px] w-[58px] bg-[#4F86F7] text-white shadow-[0_12px_22px_rgba(79,134,247,0.35)]"
                  : "h-9 w-9 text-[#9FC6F8]"
              }`}
            >
              <tab.icon size={tab.active ? 27 : isCompact ? 21 : 23} strokeWidth={2.35} />
            </span>
            <span className={tab.active ? "text-[11px] text-[#4F86F7]" : "text-[10px]"}>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
