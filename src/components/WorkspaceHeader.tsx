import { ArrowLeft, CalendarDays, EllipsisVertical, SlidersHorizontal, UserRound, UsersRound } from "lucide-react";
import type { Companion } from "../data/workspace";

type WorkspaceHeaderProps = {
  room: {
    title: string;
    date: string;
    status: string;
    companions: Companion[];
  };
};

export function WorkspaceHeader({ room }: WorkspaceHeaderProps) {
  return (
    <header className="space-y-5">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0 pt-2">
          <p className="text-[15px] font-black leading-none text-[#8EBDF7]">두리 워크스페이스 ✨</p>
          <h1 className="mt-3 text-[30px] font-black leading-[1.15] tracking-normal text-[#213D90]">
            부산 여행을
            <br />
            조율해볼까요?
          </h1>
        </div>
        <button className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-[24px] bg-[#4F86F7] text-white shadow-[0_14px_28px_rgba(65,113,218,0.35)]">
          <UserRound size={32} strokeWidth={2.5} />
        </button>
      </div>

      <div className="rounded-[28px] bg-white p-4 shadow-[0_9px_18px_rgba(91,129,190,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <button
            aria-label="뒤로가기"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F0F6FF] text-[#86B5F4] transition hover:bg-[#E2EEFF]"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex-1" />
          <button
            aria-label="설정"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#4F86F7] text-white transition hover:bg-[#3F73E8]"
          >
            <SlidersHorizontal size={20} strokeWidth={2.5} />
          </button>
          <button
            aria-label="더보기"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F0F6FF] text-[#86B5F4] transition hover:bg-[#E2EEFF]"
          >
            <EllipsisVertical size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-[20px] font-black leading-tight text-[#243F93]">{room.title}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-[#9ABBEA]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F6FF] px-3 py-1.5">
              <CalendarDays size={13} />
              {room.date}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F6FF] px-3 py-1.5">
              <UsersRound size={13} />
              동행자 3명
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E3EDFF] pt-4">
          <div className="flex -space-x-2">
            {room.companions.map((person) => (
              <span
                key={person.name}
                title={person.name}
                className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-sm font-black ${person.tone}`}
              >
                {person.initial}
              </span>
            ))}
          </div>
          <span className="rounded-full bg-[#E4EEFF] px-3 py-1.5 text-[11px] font-black text-[#4A86F7]">
            {room.status}
          </span>
        </div>
      </div>
    </header>
  );
}
