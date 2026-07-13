import { Outlet, useLocation } from "react-router-dom";
import { DuriMobileNav } from "../components/DuriMobileNav";
import { PhoneStatusBar } from "../components/PhoneStatusBar";

export function AppShell() {
  const location = useLocation();
  const showBottomNav = !location.pathname.startsWith("/trips/") || !location.pathname.endsWith("/workspace");

  return (
    <main className="min-h-screen bg-[#D5E6FF] px-3 py-3 text-[#243C8F]">
      <div className="relative mx-auto h-[calc(100dvh-24px)] w-full max-w-[430px] overflow-hidden rounded-[42px] bg-[#EFF5FF] shadow-2xl shadow-[#7897D8]/35">
        <div data-app-scroll-root className="h-full overflow-y-auto no-scrollbar">
          <div className="px-5 pt-4">
            <PhoneStatusBar />
          </div>
          <Outlet />
        </div>

        {showBottomNav ? <DuriMobileNav /> : null}
      </div>
    </main>
  );
}
