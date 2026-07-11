import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { RoomProgressStep } from "./RoomProgressCard";
import { RoomProgressCard } from "./RoomProgressCard";
import { DuriAnalysisSummary } from "./DuriAnalysisSummary";
import {
  AnalysisEmptyState,
  CandidatePlacesPreview,
  DraftSchedulePreview,
  NextActionCard,
  RoomHomeHeader,
  RoomQuickActions,
  RoomStatsGrid,
  TripRoomNotFound,
} from "./TripRoomHomeSections";
import type { CandidatePreviewView, SchedulePreviewView } from "./TripRoomHomeSections";
import { selectTripStats } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { formatDayLabel } from "../utils/formatters";

const itineraryTypeLabels = {
  place: "장소",
  meal: "식사",
  rest: "휴식",
  transport: "이동",
} as const;

export function TripRoomHomePage() {
  const { tripId: routeTripId } = useParams();
  const tripId = routeTripId ?? "";
  const [shareMessage, setShareMessage] = useState<string>();

  const trip = useDuriStore((state) => state.tripsById[tripId]);
  const activeTripId = useDuriStore((state) => state.activeTripId);
  const usersById = useDuriStore((state) => state.usersById);
  const regionsById = useDuriStore((state) => state.regionsById);
  const placesById = useDuriStore((state) => state.placesById);
  const candidates = useDuriStore((state) => state.candidatesByTripId[tripId]);
  const itinerary = useDuriStore((state) => state.itineraryByTripId[tripId]);
  const analysis = useDuriStore((state) => state.analysesByTripId[tripId]);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const itineraryByTripId = useDuriStore((state) => state.itineraryByTripId);
  const setActiveTrip = useDuriStore((state) => state.setActiveTrip);

  useEffect(() => {
    if (trip && activeTripId !== trip.id) setActiveTrip(trip.id);
  }, [activeTripId, setActiveTrip, trip]);

  const members = useMemo(
    () => trip?.members.flatMap((member) => (usersById[member.userId] ? [usersById[member.userId]] : [])) ?? [],
    [trip, usersById],
  );
  const stats = useMemo(
    () => selectTripStats({ ...useDuriStore.getState(), candidatesByTripId, itineraryByTripId }, tripId),
    [candidatesByTripId, itineraryByTripId, tripId],
  );

  const scheduledItemByPlaceId = useMemo(
    () => new Map((itinerary ?? []).flatMap((item) => (item.placeId ? [[item.placeId, item] as const] : []))),
    [itinerary],
  );
  const candidatePreviews = useMemo<CandidatePreviewView[]>(
    () =>
      (candidates ?? []).flatMap((candidate) => {
        const place = placesById[candidate.placeId];
        if (!place) return [];
        const scheduledItem = scheduledItemByPlaceId.get(place.id);
        return [{
          id: place.id,
          name: place.name,
          category: place.category,
          tags: place.tags,
          imageUrl: place.imageUrl,
          addedByNames: candidate.addedByUserIds.flatMap((userId) => (usersById[userId] ? [usersById[userId].name] : [])),
          recommendedByDuri: candidate.recommendedByDuri,
          scheduledDay: scheduledItem && trip ? formatDayLabel(scheduledItem.date, trip.startDate) : undefined,
        }];
      }).slice(0, 4),
    [candidates, placesById, scheduledItemByPlaceId, trip, usersById],
  );
  const schedulePreviews = useMemo<SchedulePreviewView[]>(
    () =>
      [...(itinerary ?? [])]
        .sort((left, right) => getItineraryTimestamp(left.date, left.startTime) - getItineraryTimestamp(right.date, right.startTime))
        .slice(0, 4)
        .map((item) => {
          const place = item.placeId ? placesById[item.placeId] : undefined;
          return {
            id: item.id,
            dayLabel: trip ? formatDayLabel(item.date, trip.startDate) : item.date,
            startTime: item.startTime,
            name: place?.name ?? item.note ?? itineraryTypeLabels[item.itemType],
            category: place?.category ?? itineraryTypeLabels[item.itemType],
          };
        }),
    [itinerary, placesById, trip],
  );

  if (!trip) return <TripRoomNotFound />;

  const progressSteps = createProgressSteps({
    status: trip.status,
    completedPreferences: stats.completedPreferenceCount,
    preferenceTarget: stats.preferenceTargetCount,
    candidateCount: stats.candidateCount,
    itineraryCount: itinerary?.length ?? 0,
  });
  const completedStepCount = progressSteps.filter((step) => step.status === "completed").length;
  const activeStepCount = progressSteps.filter((step) => step.status === "active").length;
  const progressPercent = Math.round(
    (progressSteps.reduce((score, step) => score + (step.status === "completed" ? 1 : step.status === "active" ? 0.5 : 0), 0) /
      progressSteps.length) *
      100,
  );

  const activateTrip = () => {
    if (useDuriStore.getState().activeTripId !== trip.id) setActiveTrip(trip.id);
  };

  const shareTrip = async () => {
    const message = `${trip.title} 여행방에 함께해요! ${window.location.href}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(message);
      setShareMessage("초대 문구를 복사했어요.");
    } catch {
      setShareMessage("이 환경에서는 자동 복사를 사용할 수 없어요.");
    }
  };

  const nextAction = getNextAction(trip.id, stats.candidateCount, itinerary?.length ?? 0, stats.unplannedCount);

  return (
    <div className="overflow-x-hidden px-5 pb-32 pt-2">
      <RoomHomeHeader
        trip={trip}
        regionName={regionsById[trip.regionId]?.name ?? "지역 미정"}
        members={members}
        shareMessage={shareMessage}
        onShare={shareTrip}
      />

      <div className="mt-7 space-y-7">
        <RoomProgressCard
          summary={{
            percent: progressPercent,
            label: `5단계 중 ${completedStepCount}단계 완료${activeStepCount ? ` · ${activeStepCount}단계 진행 중` : ""}`,
            message: createProgressMessage(stats.completedPreferenceCount, stats.preferenceTargetCount, stats.candidateCount, itinerary?.length ?? 0),
            cta: "계획 계속하기",
          }}
          steps={progressSteps}
          to={`/trips/${trip.id}/workspace`}
        />

        <RoomStatsGrid stats={stats} />
        <RoomQuickActions tripId={trip.id} onExplore={activateTrip} />
        <CandidatePlacesPreview candidates={candidatePreviews} onExplore={activateTrip} />
        <DraftSchedulePreview items={schedulePreviews} tripId={trip.id} />
        {analysis ? <DuriAnalysisSummary summary={analysis} to={`/trips/${trip.id}/workspace`} /> : <AnalysisEmptyState tripId={trip.id} />}
        <NextActionCard {...nextAction} onClick={nextAction.to === "/explore" ? activateTrip : undefined} />
      </div>
    </div>
  );
}

function getItineraryTimestamp(date: string, time: string) {
  const timestamp = Date.parse(`${date}T${time}:00`);
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
}

function createProgressSteps({
  status,
  completedPreferences,
  preferenceTarget,
  candidateCount,
  itineraryCount,
}: {
  status: "planning" | "drafting" | "confirmed" | "completed";
  completedPreferences: number;
  preferenceTarget: number;
  candidateCount: number;
  itineraryCount: number;
}): RoomProgressStep[] {
  const preferenceStatus = preferenceTarget > 0 && completedPreferences === preferenceTarget
    ? "completed"
    : completedPreferences > 0
      ? "active"
      : "pending";

  return [
    { title: "여행방 생성", description: "여행 지역과 날짜를 정했어요.", status: "completed" },
    {
      title: "동행자 성향 응답",
      description: `${completedPreferences}/${preferenceTarget}명이 응답했어요.`,
      status: preferenceStatus,
    },
    {
      title: "후보 장소 수집",
      description: candidateCount ? `${candidateCount}곳을 후보로 모으는 중이에요.` : "함께 가고 싶은 장소를 모아보세요.",
      status: candidateCount ? "active" : "pending",
    },
    {
      title: "일정 구성",
      description: itineraryCount ? `${itineraryCount}개 일정 항목을 구성하는 중이에요.` : "후보 장소를 일정으로 배치해 보세요.",
      status: itineraryCount ? "active" : "pending",
    },
    {
      title: "최종 확인",
      description: status === "confirmed" || status === "completed" ? "최종 일정을 확인했어요." : "모두와 확인한 뒤 일정을 확정해요.",
      status: status === "confirmed" || status === "completed" ? "completed" : "pending",
    },
  ];
}

function createProgressMessage(completedPreferences: number, target: number, candidateCount: number, itineraryCount: number) {
  if (target > 0 && completedPreferences < target) return `성향 응답 ${completedPreferences}/${target}명이 완료됐어요. 현재 응답으로도 장소를 탐색할 수 있어요.`;
  if (!candidateCount) return "성향 응답이 준비됐어요. 이제 함께 가고 싶은 장소를 모아보세요.";
  if (!itineraryCount) return "후보 장소가 모였어요. 워크스페이스에서 일정을 구성해 보세요.";
  return "후보 장소와 일정을 함께 확인하고 남은 조율을 마무리해 보세요.";
}

function getNextAction(tripId: string, candidateCount: number, itineraryCount: number, unplannedCount: number) {
  if (!candidateCount) {
    return {
      title: "첫 후보 장소를 찾아볼까요?",
      description: "탐색 화면에서 마음에 드는 장소를 현재 여행방 후보로 모아보세요.",
      cta: "장소 탐색하기",
      to: "/explore",
    };
  }
  if (!itineraryCount) {
    return {
      title: "후보를 일정으로 구성해 보세요",
      description: "모아둔 장소를 날짜와 시간에 맞춰 배치할 차례예요.",
      cta: "워크스페이스 열기",
      to: `/trips/${tripId}/workspace`,
    };
  }
  return {
    title: unplannedCount ? `미배치 후보 ${unplannedCount}곳을 확인해요` : "두리 분석으로 마지막 조율을 해요",
    description: unplannedCount ? "아직 일정에 넣지 않은 후보를 워크스페이스에서 확인해 보세요." : "현재 일정과 동행자 선호를 함께 확인해 보세요.",
    cta: "워크스페이스 열기",
    to: `/trips/${tripId}/workspace`,
  };
}
