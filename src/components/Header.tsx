import { Bell, UserRound } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-duri-green text-[18px] font-extrabold text-white shadow-card">
            두
          </div>
          <p className="text-[24px] font-extrabold leading-none tracking-normal text-duri-ink">두리</p>
        </div>
        <p className="mt-3 text-[22px] font-bold leading-[1.25] tracking-normal text-duri-ink">
          이번 여행도
          <br />
          같이 맞춰볼까요?
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          aria-label="알림"
          className="grid h-10 w-10 place-items-center rounded-full border border-duri-line bg-white text-duri-muted shadow-sm transition hover:border-duri-green/40 hover:text-duri-green"
        >
          <Bell size={19} strokeWidth={2.2} />
        </button>
        <button
          aria-label="프로필"
          className="grid h-10 w-10 place-items-center rounded-full bg-duri-mint text-duri-green-dark transition hover:bg-duri-green hover:text-white"
        >
          <UserRound size={19} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
