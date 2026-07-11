import { ArrowLeft, CalendarDays, EllipsisVertical, MapPin, Share2, UsersRound } from "lucide-react";
import type { Companion } from "../data/roomHome";

type RoomMainHeaderProps = {
  room: {
    title: string;
    region: string;
    date: string;
    status: string;
    companions: Companion[];
  };
};

export function RoomMainHeader({ room }: RoomMainHeaderProps) {
  return (
    <header className="rounded-lg border border-duri-line bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <button
          aria-label="뒤로가기"
          className="grid h-10 w-10 place-items-center rounded-lg bg-duri-bg text-duri-ink transition hover:bg-duri-mint"
        >
          <ArrowLeft size={20} strokeWidth={2.3} />
        </button>
        <div className="flex items-center gap-2">
          <button className="flex h-10 items-center gap-1.5 rounded-lg bg-duri-green px-3 text-[13px] font-extrabold text-white transition hover:bg-duri-green-dark">
            <Share2 size={16} strokeWidth={2.3} />
            초대
          </button>
          <button
            aria-label="더보기"
            className="grid h-10 w-10 place-items-center rounded-lg border border-duri-line bg-white text-duri-muted transition hover:text-duri-ink"
          >
            <EllipsisVertical size={20} strokeWidth={2.3} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-duri-mint px-3 py-1.5 text-xs font-extrabold text-duri-green-dark">
            {room.status}
          </div>
          <h1 className="mt-3 text-[24px] font-extrabold leading-tight tracking-normal text-duri-ink">{room.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-duri-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-duri-bg px-3 py-1.5">
              <MapPin size={14} />
              {room.region}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-duri-bg px-3 py-1.5">
              <CalendarDays size={14} />
              {room.date}
            </span>
          </div>
        </div>

        <div className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-lg bg-[#E2F0F3] text-duri-blue">
          <MapPin size={30} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-duri-line pt-4">
        <div>
          <p className="text-xs font-semibold text-duri-muted">동행자</p>
          <div className="mt-2 flex -space-x-2">
            {room.companions.map((person) => (
              <span
                key={person.name}
                title={person.name}
                className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-sm font-extrabold ${person.tone}`}
              >
                {person.initial}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-duri-bg px-3 py-2 text-xs font-extrabold text-duri-muted">
          <UsersRound size={16} />
          3명 참여
        </div>
      </div>
    </header>
  );
}
