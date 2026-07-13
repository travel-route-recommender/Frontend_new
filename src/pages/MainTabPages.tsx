import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { DuriWorkspaceScreen } from "../components/DuriWorkspaceScreen";
import { MyPageDashboard } from "../components/MyPageDashboard";
import { SavedPlacesPage } from "../components/SavedPlacesPage";
import { SimpleWorkspacePage } from "../components/SimpleWorkspacePage";
import { TripListPage } from "../components/TripListPage";
import { selectTripStats } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { formatDayLabel } from "../utils/formatters";

function useActiveTripSummary() {
  const activeTripId = useDuriStore((state) => state.activeTripId);
  const trip = useDuriStore((state) => state.tripsById[state.activeTripId]);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const itineraryByTripId = useDuriStore((state) => state.itineraryByTripId);
  const placesById = useDuriStore((state) => state.placesById);
  const preferenceResultsByUserId = useDuriStore((state) => state.preferenceResultsByUserId);
  const stats = useMemo(
    () => selectTripStats({ ...useDuriStore.getState(), candidatesByTripId, itineraryByTripId, preferenceResultsByUserId }, activeTripId),
    [activeTripId, candidatesByTripId, itineraryByTripId, preferenceResultsByUserId],
  );
  const itineraryLines = useMemo(() => {
    if (!trip) return [];
    const byDay = new Map<string, string[]>();
    for (const item of itineraryByTripId[trip.id] ?? []) {
      if (!item.placeId || !placesById[item.placeId]) continue;
      const day = formatDayLabel(item.date, trip.startDate);
      byDay.set(day, [...(byDay.get(day) ?? []), placesById[item.placeId].name]);
    }
    return [...byDay.entries()].map(([day, names]) => `${day} ${names.join(" → ")}`);
  }, [itineraryByTripId, placesById, trip]);
  return { activeTripId, trip, stats, itineraryLines };
}

export function TripsPage() {
  return <TripListPage />;
}

export function DuriPage() {
  const { activeTripId, stats, itineraryLines } = useActiveTripSummary();
  return (
    <SimpleWorkspacePage
      eyebrow="두리"
      title="취향을 맞춰 일정 만들기"
      description="동행자 응답과 후보 장소를 비교해서 자연스러운 순서를 찾아요."
      primaryLabel="두리 제안 보기"
      secondaryLabel="취향 다시 보기"
      icon="duri"
      primaryTo={activeTripId ? `/trips/${activeTripId}/workspace` : "/trips"}
      stats={[
        ["후보 장소", `${stats.candidateCount}개`],
        ["일정 반영", `${stats.scheduledCount}개`],
        ["미배치", `${stats.unplannedCount}개`],
        ["성향 진단", `${stats.completedPreferenceCount}/${stats.preferenceTargetCount}`],
      ]}
      itineraryLines={itineraryLines}
    />
  );
}

export function SavedPage() {
  return <SavedPlacesPage />;
}

export function MyPage() {
  return <MyPageDashboard />;
}

export function TripWorkspaceRoute() {
  const { tripId } = useParams();
  const tripExists = useDuriStore((state) => Boolean(tripId && state.tripsById[tripId]));
  if (!tripId || !tripExists) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#D5E6FF] px-6 text-center text-[#243C8F]">
        <div><p className="text-[13px] font-black text-[#7FADED]">여행방 없음</p><h1 className="mt-2 text-[24px] font-black">여행방을 찾을 수 없어요</h1><p className="mt-2 text-[13px] font-bold text-[#7898CE]">내 여행방에서 다시 선택해 주세요.</p></div>
      </main>
    );
  }
  return <DuriWorkspaceScreen tripId={tripId} />;
}
