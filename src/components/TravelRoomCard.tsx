import { ArrowRight, CalendarDays, MapPinned, UsersRound } from "lucide-react";

type TravelRoomCardProps = {
  room: {
    title: string;
    date: string;
    companions: string[];
    stats: string[];
    schedule: string[];
  };
};

export function TravelRoomCard({ room }: TravelRoomCardProps) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-duri-line bg-white shadow-card">
      <div className="border-b border-duri-line bg-[#FBFCFA] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-duri-green-dark">진행 중인 여행방</p>
            <h1 className="mt-1 text-[22px] font-extrabold leading-tight tracking-normal text-duri-ink">
              {room.title}
            </h1>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-duri-mint text-duri-green-dark">
            <MapPinned size={22} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <InfoPill icon={CalendarDays} label={room.date} />
          <InfoPill icon={UsersRound} label={room.companions.join(", ")} />
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          {room.stats.map((stat) => (
            <div key={stat} className="rounded-2xl bg-duri-bg px-3 py-3">
              <p className="text-[13px] font-bold leading-snug text-duri-ink">{stat}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-[#F4F8F6] px-4 py-3">
          {room.schedule.map((item) => (
            <p key={item} className="text-[13px] font-medium leading-6 text-duri-muted">
              {item}
            </p>
          ))}
        </div>

        <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-duri-green text-[15px] font-bold text-white transition hover:bg-duri-green-dark">
          여행방 들어가기
          <ArrowRight size={18} strokeWidth={2.3} />
        </button>
      </div>
    </article>
  );
}

type InfoPillProps = {
  icon: typeof CalendarDays;
  label: string;
};

function InfoPill({ icon: Icon, label }: InfoPillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-duri-muted ring-1 ring-duri-line">
      <Icon size={14} />
      {label}
    </span>
  );
}
