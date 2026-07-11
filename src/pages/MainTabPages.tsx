import { ArrowLeft, Construction } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { DuriWorkspaceScreen } from "../components/DuriWorkspaceScreen";
import { SimpleWorkspacePage } from "../components/SimpleWorkspacePage";
import { TripListPage } from "../components/TripListPage";
import { selectTripStats } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { formatDayLabel, formatTripDateRange, formatTripStatus } from "../utils/formatters";

function useActiveTripSummary() {
  const activeTripId = useDuriStore((state) => state.activeTripId);
  const trip = useDuriStore((state) => state.tripsById[state.activeTripId]);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const itineraryByTripId = useDuriStore((state) => state.itineraryByTripId);
  const placesById = useDuriStore((state) => state.placesById);
  const stats = useMemo(
    () => selectTripStats({ ...useDuriStore.getState(), candidatesByTripId, itineraryByTripId }, activeTripId),
    [activeTripId, candidatesByTripId, itineraryByTripId],
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

export function NewTripPlaceholderPage() {
  return (
    <TripRoutePlaceholder
      eyebrow="새 여행방"
      title="여행방 만들기를 준비하고 있어요"
      description="생성 단계는 다음 작업에서 연결할 예정이에요."
    />
  );
}

export function TripDetailPlaceholderPage() {
  const { tripId } = useParams();
  const trip = useDuriStore((state) => (tripId ? state.tripsById[tripId] : undefined));

  if (!trip) {
    return (
      <TripRoutePlaceholder
        eyebrow="여행방 없음"
        title="여행방을 찾을 수 없어요"
        description="내 여행방 목록에서 다시 선택해 주세요."
      />
    );
  }

  return (
    <TripRoutePlaceholder
      eyebrow="여행방 홈"
      title={trip.title || "이름 없는 여행방"}
      description={`${formatTripDateRange(trip.startDate, trip.endDate)} · 여행방 홈은 다음 작업에서 연결할 예정이에요.`}
      workspaceTo={`/trips/${trip.id}/workspace`}
    />
  );
}

function TripRoutePlaceholder({
  eyebrow,
  title,
  description,
  workspaceTo,
}: {
  eyebrow: string;
  title: string;
  description: string;
  workspaceTo?: string;
}) {
  return (
    <div className="px-5 pb-32 pt-8">
      <section className="rounded-[30px] bg-white px-5 py-7 text-center shadow-[0_12px_26px_rgba(79,134,247,0.12)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-[#EAF3FF] text-[#4388FF]">
          <Construction size={27} />
        </span>
        <p className="mt-5 text-[12px] font-black text-[#7FADED]">{eyebrow}</p>
        <h1 className="mt-1 text-[23px] font-black leading-tight text-[#243C8F]">{title}</h1>
        <p className="mt-3 text-[13px] font-bold leading-6 text-[#7898CE]">{description}</p>
        {workspaceTo ? (
          <Link to={workspaceTo} className="mt-5 flex h-12 items-center justify-center rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white">
            워크스페이스 열기
          </Link>
        ) : null}
        <Link to="/trips" className="mt-3 flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#F1F6FF] text-[14px] font-black text-[#4388FF]">
          <ArrowLeft size={17} />내 여행방으로 돌아가기
        </Link>
      </section>
    </div>
  );
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
  const savedCount = useDuriStore((state) => state.savedPlaceIdsByUserId[state.currentUserId]?.length ?? 0);
  const { stats } = useActiveTripSummary();
  return (
    <SimpleWorkspacePage
      eyebrow="내 여행지"
      title={`저장한 장소 ${savedCount}곳`}
      description="부산 여행방에 담을 후보를 다시 확인해요."
      primaryLabel="지도에서 보기"
      secondaryLabel="장소 더 찾기"
      icon="saved"
      primaryTo="/explore/map"
      stats={[
        ["저장 장소", `${savedCount}개`],
        ["후보 장소", `${stats.candidateCount}개`],
        ["일정 반영", `${stats.scheduledCount}개`],
        ["미배치", `${stats.unplannedCount}개`],
      ]}
    />
  );
}

export function MyPage() {
  const currentUser = useDuriStore((state) => state.usersById[state.currentUserId]);
  const preference = useDuriStore((state) => state.preferenceResultsByUserId[state.currentUserId]);
  return (
    <SimpleWorkspacePage
      eyebrow="마이페이지"
      title={`${currentUser?.name ?? "사용자"}님의 여행 취향`}
      description={`${preference?.profileType ?? "성향 진단 전"} · ${(preference?.traits ?? []).join("와 ")} 코스를 선호해요.`}
      primaryLabel="테스트 다시 보기"
      secondaryLabel="프로필 편집"
      icon="profile"
      primaryTo="/duri"
      stats={[]}
    />
  );
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
