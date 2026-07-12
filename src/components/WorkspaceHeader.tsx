import { ArrowLeft, CalendarDays, Check, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { TripRoom, User } from "../domain";
import { formatTripDateRange } from "../utils/formatters";

type WorkspaceHeaderProps = {
  room: TripRoom;
  companions: User[];
  regionName: string;
  onOpenAnalysis: () => void;
};

export function WorkspaceHeader({ room, companions, regionName, onOpenAnalysis }: WorkspaceHeaderProps) {
  return (
    <header className="rounded-[24px] bg-white p-3 shadow-[0_8px_18px_rgba(91,129,190,0.13)]">
      <div className="flex items-center gap-3">
        <Link to={`/trips/${room.id}`} aria-label={`${room.title} 여행방으로 돌아가기`} className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] bg-[#F0F6FF] text-[#6F9DDB]">
          <ArrowLeft size={19} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-black text-[#213D90]">{room.title}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-[10px] font-bold text-[#8BAFE4]"><CalendarDays size={12} />{regionName} · {formatTripDateRange(room.startDate, room.endDate)}</p>
        </div>
        <button type="button" onClick={onOpenAnalysis} className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] bg-[#4388FF] text-white" aria-label="두리 분석 보기">
          <Sparkles size={18} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#E5EEF9] pt-3">
        <span className="flex items-center gap-1 rounded-full bg-[#EAF3FF] px-3 py-1.5 text-[10px] font-black text-[#4388FF]"><Check size={12} />변경 자동 저장</span>
        <span className="flex items-center gap-1 text-[10px] font-black text-[#8BAFE4]"><UsersRound size={12} />동행자 {companions.length}명</span>
      </div>
    </header>
  );
}
