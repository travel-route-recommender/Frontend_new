import { Bot, Building2, Bookmark, Home, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export type MobileNavKey = "trips" | "duri" | "home" | "saved" | "profile";

const navItems = [
  { key: "trips" as const, label: "내 여행방", icon: Building2, to: "/trips" },
  { key: "duri" as const, label: "두리", icon: Bot, to: "/duri" },
  { key: "home" as const, label: "홈", icon: Home, to: "/" },
  { key: "saved" as const, label: "내 여행지", icon: Bookmark, to: "/saved" },
  { key: "profile" as const, label: "마이페이지", icon: UserRound, to: "/mypage" },
];

export function DuriMobileNav() {
  const location = useLocation();

  return (
    <nav className="absolute inset-x-4 bottom-3 z-30 rounded-[32px] bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_18px_36px_rgba(87,130,198,0.24)]">
      <div className="grid grid-cols-5 items-end gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={`flex min-h-[58px] flex-col items-center justify-end gap-1 text-[10px] font-black transition ${
                isActive ? "text-[#4388FF]" : "text-[#B6D4F8]"
              }`}
            >
              <span
                className={`grid place-items-center rounded-full transition ${
                  isActive
                    ? "-mt-8 h-[58px] w-[58px] bg-[#4388FF] text-white shadow-[0_12px_22px_rgba(67,136,255,0.36)]"
                    : "h-9 w-9 text-[#9BC8FA]"
                }`}
              >
                <Icon size={isActive ? 28 : 23} strokeWidth={2.3} />
              </span>
              <span className="leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
