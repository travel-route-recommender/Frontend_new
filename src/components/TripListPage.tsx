import { Building2, Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import type { TripRoom } from "../domain";
import {
  selectCompletedTripsForCurrentUser,
  selectPlanningTripsForCurrentUser,
  selectTripStats,
} from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { formatTripDateRange, formatTripStatus } from "../utils/formatters";
import { TravelRoomCard } from "./TravelRoomCard";
import { EmptyState } from "./EmptyState";

export function TripListPage() {
  const planningTrips = useDuriStore(useShallow(selectPlanningTripsForCurrentUser));
  const completedTrips = useDuriStore(useShallow(selectCompletedTripsForCurrentUser));
  const usersById = useDuriStore((state) => state.usersById);
  const regionsById = useDuriStore((state) => state.regionsById);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const itineraryByTripId = useDuriStore((state) => state.itineraryByTripId);
  const preferenceResultsByUserId = useDuriStore((state) => state.preferenceResultsByUserId);

  const statsByTripId = useMemo(() => {
    const state = { ...useDuriStore.getState(), candidatesByTripId, itineraryByTripId, preferenceResultsByUserId };
    return Object.fromEntries([...planningTrips, ...completedTrips].map((trip) => [trip.id, selectTripStats(state, trip.id)]));
  }, [candidatesByTripId, completedTrips, itineraryByTripId, planningTrips, preferenceResultsByUserId]);

  return (
    <div className="overflow-x-hidden px-5 pb-32 pt-2">
      <header>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-black text-[#7FADED]">My Trips</p>
            <h1 className="mt-1 text-[29px] font-black leading-tight text-[#243C8F]">내 여행방</h1>
            <p className="mt-2 text-[13px] font-bold leading-5 text-[#7898CE]">함께 준비 중인 여행과 지난 추억을 한곳에서 확인해요.</p>
          </div>
          <span className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-[22px] bg-[#4388FF] text-white shadow-[0_14px_24px_rgba(67,136,255,0.3)]">
            <Building2 size={27} />
          </span>
        </div>

        <Link
          to="/trips/new"
          className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-[#4388FF] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(67,136,255,0.24)]"
        >
          <Plus size={19} />
          새 여행방 만들기
        </Link>
      </header>

      <TripSection title="진행 중인 여행" count={planningTrips.length}>
        {planningTrips.length ? (
          planningTrips.map((trip) => (
            <TripCardFromStore
              key={trip.id}
              trip={trip}
              regionName={regionsById[trip.regionId]?.name ?? "지역 미정"}
              members={trip.members.flatMap((member) => (usersById[member.userId] ? [usersById[member.userId]] : []))}
              stats={statsByTripId[trip.id]}
            />
          ))
        ) : (
          <PlanningEmptyState />
        )}
      </TripSection>

      <TripSection title="지난 여행" count={completedTrips.length}>
        {completedTrips.length ? (
          completedTrips.map((trip) => (
            <TripCardFromStore
              key={trip.id}
              trip={trip}
              regionName={regionsById[trip.regionId]?.name ?? "지역 미정"}
              members={trip.members.flatMap((member) => (usersById[member.userId] ? [usersById[member.userId]] : []))}
              stats={statsByTripId[trip.id]}
              completed
            />
          ))
        ) : (
          <EmptyState
            icon={Building2}
            compact
            title="아직 지난 여행이 없어요."
            description="새 여행을 만들면 완료된 여행도 이곳에서 모아볼 수 있어요."
            actionLabel="새 여행방 만들기"
            actionTo="/trips/new"
          />
        )}
      </TripSection>
    </div>
  );
}

function TripSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="mt-7">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[21px] font-black text-[#243C8F]">{title}</h2>
        <span className="rounded-full bg-[#E4EEFF] px-2.5 py-1 text-[11px] font-black text-[#4388FF]">{count}</span>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TripCardFromStore({
  trip,
  regionName,
  members,
  stats,
  completed,
}: {
  trip: TripRoom;
  regionName: string;
  members: Array<{ id: string; name: string; initial: string }>;
  stats?: ReturnType<typeof selectTripStats>;
  completed?: boolean;
}) {
  return (
    <TravelRoomCard
      tripId={trip.id}
      title={trip.title || "이름 없는 여행방"}
      regionName={regionName}
      dateLabel={formatTripDateRange(trip.startDate, trip.endDate)}
      statusLabel={formatTripStatus(trip.status)}
      members={members}
      memberCount={trip.members.length}
      candidateCount={stats?.candidateCount ?? 0}
      scheduledCount={stats?.scheduledCount ?? 0}
      completedPreferenceCount={stats?.completedPreferenceCount ?? 0}
      preferenceTargetCount={stats?.preferenceTargetCount ?? trip.members.length}
      completed={completed}
    />
  );
}

function PlanningEmptyState() {
  return (
    <div className="rounded-[26px] bg-white px-5 py-7 text-center shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#EAF3FF] text-[#4388FF]"><Sparkles size={24} /></span>
      <h3 className="mt-4 text-[17px] font-black text-[#243C8F]">아직 준비 중인 여행이 없어요</h3>
      <p className="mt-1 text-[13px] font-bold leading-5 text-[#8CAADA]">새 여행방을 만들고 동행자와 장소를 모아보세요.</p>
      <Link to="/trips/new" className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-[17px] bg-[#4388FF] px-5 text-[13px] font-black text-white">
        <Plus size={16} />새 여행방 만들기
      </Link>
    </div>
  );
}
