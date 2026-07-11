import { Check, Plus, UserRound } from "lucide-react";
import type { CandidatePlace, ScheduledPlace } from "../data/workspace";

type CandidateBoardPanelProps = {
  candidates: CandidatePlace[];
  schedule: ScheduledPlace[];
  onAddPlace: (place: CandidatePlace) => void;
};

export function CandidateBoardPanel({ candidates, schedule, onAddPlace }: CandidateBoardPanelProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[24px] font-black tracking-normal text-[#213D90]">후보 장소 보드</h2>
        <p className="mt-1 text-sm font-bold leading-6 text-[#7CA4DE]">미배치 장소를 일정 끝에 추가하거나 배치된 상태를 확인해요.</p>
      </div>

      {candidates.map((place) => {
        const scheduledDay = schedule.find((item) => item.sourcePlaceId === place.id)?.day;

        return (
          <article key={place.id} className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_22px_rgba(91,129,190,0.14)]">
            <div
              className="h-24"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(36,66,183,0.72), rgba(79,134,247,0.22)), radial-gradient(circle at 72% 18%, rgba(255,255,255,0.42), transparent 24%), radial-gradient(circle at 22% 78%, rgba(28,47,111,0.5), transparent 36%)",
              }}
            />
            <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black text-[#4F86F7]">{place.category}</p>
                <h3 className="mt-1 truncate text-[19px] font-black text-[#213D90]">{place.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {place.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#F0F6FF] px-2.5 py-1 text-[11px] font-black text-[#8BAFE4]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onAddPlace(place)}
                disabled={Boolean(scheduledDay)}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-[17px] text-white ${
                  scheduledDay ? "bg-[#B8D3F7]" : "bg-[#4F86F7]"
                }`}
              >
                {scheduledDay ? <Check size={18} /> : <Plus size={19} />}
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#8BAFE4]">
              <UserRound size={14} />
              {place.addedBy.join(", ")} 담음 · {scheduledDay ? `${scheduledDay} 배치됨` : "미배치"}
            </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
