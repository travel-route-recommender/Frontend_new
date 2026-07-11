import { ArrowRight, CalendarDays, MapPin, MapPinned, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

type TripCardMember = {
  id: string;
  name: string;
  initial: string;
};

type TravelRoomCardProps = {
  tripId: string;
  title: string;
  regionName: string;
  dateLabel: string;
  statusLabel: string;
  members: TripCardMember[];
  memberCount: number;
  candidateCount: number;
  scheduledCount: number;
  completedPreferenceCount: number;
  preferenceTargetCount: number;
  completed?: boolean;
};

const avatarTones = [
  "bg-[#4388FF] text-white",
  "bg-[#DCEBFF] text-[#376DCE]",
  "bg-[#FFF0CE] text-[#8A6614]",
];

export function TravelRoomCard({
  tripId,
  title,
  regionName,
  dateLabel,
  statusLabel,
  members,
  memberCount,
  candidateCount,
  scheduledCount,
  completedPreferenceCount,
  preferenceTargetCount,
  completed = false,
}: TravelRoomCardProps) {
  return (
    <Link
      to={`/trips/${tripId}`}
      className="group block overflow-hidden rounded-[28px] bg-white shadow-[0_10px_24px_rgba(79,134,247,0.13)] transition active:scale-[0.99]"
      aria-label={`${title} 여행방 보기`}
    >
      <article>
        <div className={`px-5 py-5 ${completed ? "bg-[#F5F9FF]" : "bg-[#4388FF]"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className={`text-[12px] font-black ${completed ? "text-[#7FADED]" : "text-[#D9E9FF]"}`}>
                {completed ? "완료된 여행" : "함께 준비 중"}
              </p>
              <h3 className={`mt-1 truncate text-[21px] font-black ${completed ? "text-[#243C8F]" : "text-white"}`}>{title}</h3>
              <p className={`mt-2 flex items-center gap-1 text-[12px] font-bold ${completed ? "text-[#7898CE]" : "text-[#DDEBFF]"}`}>
                <MapPin size={13} />
                {regionName}
              </p>
            </div>
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] ${completed ? "bg-[#E7F1FF] text-[#4388FF]" : "bg-white/18 text-white"}`}>
              <MapPinned size={23} />
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <InfoPill icon={CalendarDays} label={dateLabel} completed={completed} />
            <InfoPill icon={UsersRound} label={`${memberCount}명`} completed={completed} />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member, index) => (
                <span
                  key={member.id}
                  title={member.name}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-[12px] font-black ${avatarTones[index % avatarTones.length]}`}
                >
                  {member.initial}
                </span>
              ))}
            </div>
            <span className="rounded-full bg-[#EAF3FF] px-3 py-1.5 text-[11px] font-black text-[#4388FF]">{statusLabel}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="후보 장소" value={`${candidateCount}개`} />
            <Stat label="일정 반영" value={`${scheduledCount}개`} />
            <Stat label="성향 응답" value={`${completedPreferenceCount}/${preferenceTargetCount}`} />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#E4EDFA] pt-4">
            <span className="text-[13px] font-black text-[#7898CE]">여행방 자세히 보기</span>
            <span className="grid h-9 w-9 place-items-center rounded-[14px] bg-[#EAF3FF] text-[#4388FF] transition group-hover:translate-x-0.5">
              <ArrowRight size={17} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-[#F5F9FF] px-2 py-3 text-center">
      <p className="truncate text-[10px] font-black text-[#9CB7DD]">{label}</p>
      <p className="mt-1 text-[16px] font-black text-[#243C8F]">{value}</p>
    </div>
  );
}

type InfoPillProps = {
  icon: typeof CalendarDays;
  label: string;
  completed: boolean;
};

function InfoPill({ icon: Icon, label, completed }: InfoPillProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black ${completed ? "bg-white text-[#7898CE]" : "bg-white/18 text-white"}`}>
      <Icon size={13} />
      {label}
    </span>
  );
}
