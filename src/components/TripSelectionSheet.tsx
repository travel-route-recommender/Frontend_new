import { Check, MapPin, Plus, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { EntityId, Region, TripRoom } from "../domain";
import { formatTripDateRange } from "../utils/formatters";

type TripSelectionSheetProps = {
  trips: TripRoom[];
  regionsById: Record<EntityId, Region>;
  candidateTripIds: Set<EntityId>;
  onClose: () => void;
  onSelect: (tripId: EntityId) => void;
};

export function TripSelectionSheet({
  trips,
  regionsById,
  candidateTripIds,
  onClose,
  onSelect,
}: TripSelectionSheetProps) {
  return (
    <div className="absolute inset-0 z-[70] flex items-end bg-[#19336A]/28 backdrop-blur-[2px]">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="여행방 선택 닫기" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-selection-title"
        aria-describedby="trip-selection-description"
        className="relative z-10 max-h-[78%] w-full overflow-y-auto rounded-t-[32px] bg-white px-5 pb-7 pt-4 shadow-[0_-18px_40px_rgba(36,60,143,0.22)] no-scrollbar"
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F1F6FF] text-[#243C8F]"
          aria-label="여행방 선택 닫기"
        >
          <X size={19} />
        </button>

        <p className="text-[12px] font-black text-[#7FADED]">Add to trip</p>
        <h2 id="trip-selection-title" className="mt-1 text-[24px] font-black text-[#243C8F]">여행방 선택</h2>
        <p id="trip-selection-description" className="mt-2 pr-8 text-[13px] font-bold leading-5 text-[#7898CE]">
          이 장소를 함께 검토할 진행 중인 여행방을 골라 주세요.
        </p>

        {trips.length ? (
          <div className="mt-5 space-y-3">
            {trips.map((trip) => {
              const alreadyCandidate = candidateTripIds.has(trip.id);
              const regionName = regionsById[trip.regionId]?.name ?? "지역 미정";
              return (
                <button
                  type="button"
                  key={trip.id}
                  onClick={() => onSelect(trip.id)}
                  disabled={alreadyCandidate}
                  className={`flex w-full items-center gap-3 rounded-[22px] border p-4 text-left transition ${
                    alreadyCandidate
                      ? "cursor-not-allowed border-[#DCE9FA] bg-[#F3F7FD] opacity-70"
                      : "border-[#DCE9FA] bg-white shadow-[0_7px_18px_rgba(79,134,247,0.1)] hover:border-[#9DC4FA]"
                  }`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[16px] ${alreadyCandidate ? "bg-[#DCE9FA] text-[#7FADED]" : "bg-[#EAF3FF] text-[#4388FF]"}`}>
                    {alreadyCandidate ? <Check size={20} /> : <MapPin size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-black text-[#243C8F]">{trip.title}</span>
                    <span className="mt-1 block truncate text-[11px] font-bold text-[#88A8D8]">
                      {regionName} · {formatTripDateRange(trip.startDate, trip.endDate)}
                    </span>
                    <span className={`mt-2 flex items-center gap-1 text-[10px] font-black ${alreadyCandidate ? "text-[#4388FF]" : "text-[#9CB7DD]"}`}>
                      {alreadyCandidate ? <><Check size={12} />이미 담긴 장소</> : <><Users size={12} />참여자 {trip.members.length}명</>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] bg-[#F5F9FF] px-5 py-7 text-center">
            <MapPin size={25} className="mx-auto text-[#91BFF5]" />
            <h3 className="mt-3 text-[16px] font-black text-[#243C8F]">후보를 담을 여행방이 없어요</h3>
            <p className="mt-1 text-[12px] font-bold leading-5 text-[#8CAADA]">새 여행방을 만든 뒤 함께 가고 싶은 장소를 모아보세요.</p>
            <Link
              to="/trips/new"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white"
            >
              <Plus size={17} />새 여행방 만들기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
