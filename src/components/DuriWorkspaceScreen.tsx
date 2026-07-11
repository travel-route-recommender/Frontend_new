import { useMemo, useState } from "react";
import { BottomTabBar } from "./BottomTabBar";
import { CandidateBoardPanel } from "./CandidateBoardPanel";
import { CandidateBottomSheet } from "./CandidateBottomSheet";
import { DaySelector } from "./DaySelector";
import { DuriAnalysisWorkspace } from "./DuriAnalysisWorkspace";
import { DuriSuggestionCard } from "./DuriSuggestionCard";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { WorkspaceDashboardActions } from "./WorkspaceDashboardActions";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceSegmentTabs } from "./WorkspaceSegmentTabs";
import { WorkspaceStatsStrip } from "./WorkspaceStatsStrip";
import { bottomTabs, candidateFilters, dayTabs, workspaceTabs } from "../data/workspace";
import type { DayKey, FilterKey, WorkspaceTab } from "../data/workspace";
import { useDuriStore } from "../store/useDuriStore";
import { getTripDateForDayLabel } from "../utils/formatters";
import type { CandidateView, ItineraryView } from "./workspaceViewModels";

export function DuriWorkspaceScreen({ tripId }: { tripId: string }) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("schedule");
  const [activeDay, setActiveDay] = useState<DayKey>("Day 1");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState("현재 일정표를 수동으로 조정할 수 있어요.");
  const [highlightedMetric, setHighlightedMetric] = useState<string | undefined>();

  const trip = useDuriStore((state) => state.tripsById[tripId]);
  const usersById = useDuriStore((state) => state.usersById);
  const placesById = useDuriStore((state) => state.placesById);
  const candidates = useDuriStore((state) => state.candidatesByTripId[tripId]);
  const itinerary = useDuriStore((state) => state.itineraryByTripId[tripId]);
  const analysis = useDuriStore((state) => state.analysesByTripId[tripId]);
  const currentUserId = useDuriStore((state) => state.currentUserId);
  const addPlaceToItinerary = useDuriStore((state) => state.addPlaceToItinerary);
  const removeItineraryItem = useDuriStore((state) => state.removeItineraryItem);

  const companions = useMemo(
    () => trip?.members.flatMap((member) => (usersById[member.userId] ? [usersById[member.userId]] : [])) ?? [],
    [trip, usersById],
  );
  const candidateViews = useMemo<CandidateView[]>(
    () =>
      (candidates ?? []).flatMap((candidate) => {
        const place = placesById[candidate.placeId];
        if (!place) return [];
        const addedByUsers = candidate.addedByUserIds.flatMap((userId) => (usersById[userId] ? [usersById[userId]] : []));
        return [{ candidate, place, addedByUsers }];
      }),
    [candidates, placesById, usersById],
  );
  const scheduleViews = useMemo<ItineraryView[]>(
    () =>
      (itinerary ?? []).map((item) => ({
        item,
        place: item.placeId ? placesById[item.placeId] : undefined,
        preferredByUsers: item.preferredByUserIds.flatMap((userId) => (usersById[userId] ? [usersById[userId]] : [])),
      })),
    [itinerary, placesById, usersById],
  );
  const scheduledPlaceIds = useMemo(
    () => new Set((itinerary ?? []).flatMap((item) => (item.placeId ? [item.placeId] : []))),
    [itinerary],
  );
  const scheduledPlaces = candidateViews.filter((view) => scheduledPlaceIds.has(view.place.id)).length;
  const totalCandidates = candidateViews.length;
  const unplannedPlaces = Math.max(totalCandidates - scheduledPlaces, 0);
  const completedPreferences = trip?.members.filter((member) => member.preferenceStatus === "completed").length ?? 0;

  const dashboardMetrics = useMemo(
    () => [
      { label: "후보 장소", value: `${totalCandidates}개` },
      { label: "일정 반영", value: `${scheduledPlaces}개` },
      { label: "미배치", value: `${unplannedPlaces}개` },
      { label: "성향 진단", value: `${completedPreferences}/${trip?.members.length ?? 0}` },
    ],
    [completedPreferences, scheduledPlaces, totalCandidates, trip?.members.length, unplannedPlaces],
  );

  const filteredCandidates = useMemo(
    () => candidateViews.filter((view) => {
      const addedByMe = view.candidate.addedByUserIds.includes(currentUserId);
      const addedByCompanion = view.candidate.addedByUserIds.some((userId) => userId !== currentUserId);
      const commonInterest = view.candidate.addedByUserIds.length > 1;
      const scheduled = scheduledPlaceIds.has(view.place.id);
      if (activeFilter === "공통 관심") return commonInterest;
      if (activeFilter === "내가 담은 장소") return addedByMe;
      if (activeFilter === "동행자가 담은 장소") return addedByCompanion;
      if (activeFilter === "두리 추천") return view.candidate.recommendedByDuri;
      if (activeFilter === "미배치") return !scheduled;
      return true;
    }),
    [activeFilter, candidateViews, currentUserId, scheduledPlaceIds],
  );

  if (!trip) return null;

  const addCandidateToSchedule = (view: CandidateView) => {
    if (scheduledPlaceIds.has(view.place.id)) {
      setToast(`${view.place.name}은 이미 일정에 배치되어 있어요.`);
      return;
    }
    const targetDay = activeDay === "전체" ? "Day 1" : activeDay;
    const targetDate = getTripDateForDayLabel(targetDay, trip.startDate, trip.endDate);
    const nextOrder = (itinerary ?? []).filter((item) => item.date === targetDate).length;
    const fallbackTimes = ["20:30", "10:30", "13:30", "16:30"];
    addPlaceToItinerary({
      tripId,
      placeId: view.place.id,
      date: targetDate,
      startTime: fallbackTimes[nextOrder] ?? "20:30",
      durationMinutes: view.place.category === "시장" ? 60 : 90,
      preferredByUserIds: view.candidate.addedByUserIds,
    });
    setSheetExpanded(false);
    setHighlightedMetric("일정 반영");
    setToast(`${view.place.name}이 여행 대시보드와 ${targetDay} 일정표에 바로 반영됐어요.`);
  };

  const applySuggestion = () => {
    setSheetExpanded(false);
    setToast("두리 제안을 반영하는 흐름을 표시했어요. 실제 추천 알고리즘은 연결 전 목업입니다.");
  };
  const openCandidateSheet = () => {
    setActiveTab("schedule");
    setSheetExpanded(true);
    setActiveFilter("미배치");
  };

  return (
    <main className="min-h-screen bg-[#D5E6FF] px-3 py-3 text-[#243C8F]">
      <div className="relative mx-auto min-h-[calc(100vh-24px)] w-full max-w-[430px] overflow-hidden rounded-[42px] bg-[#EFF5FF] shadow-2xl shadow-[#7897D8]/35">
        <div className={`px-5 pt-4 ${sheetExpanded ? "pb-[560px]" : "pb-36"}`}>
          <section className="space-y-4">
            <PhoneStatusBar />
            <WorkspaceHeader room={trip} companions={companions} regionName={useDuriStore.getState().regionsById[trip.regionId]?.name ?? "부산"} />
            <WorkspaceSegmentTabs tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />
            <WorkspaceDashboardActions scheduledCount={scheduledPlaces} unplannedCount={unplannedPlaces} onSuggest={() => { setSheetExpanded(false); setActiveTab("analysis"); }} />
            <div className="rounded-[24px] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(90,125,190,0.14)]">
              <p className="text-xs font-black text-[#4A86F7]">작업 상태</p>
              <p className="mt-1 text-[13px] font-bold leading-5 text-[#6F8AC2]">{toast}</p>
            </div>
            {activeTab === "schedule" ? (
              <>
                <WorkspaceStatsStrip metrics={dashboardMetrics} highlightLabel={highlightedMetric} />
                <DaySelector days={dayTabs} activeDay={activeDay} onChange={setActiveDay} />
                <ItineraryTimeline activeDay={activeDay} tripStartDate={trip.startDate} items={scheduleViews} onOpenCandidates={openCandidateSheet} onRemoveItem={(itemId) => removeItineraryItem(tripId, itemId)} />
                {analysis ? <DuriAnalysisWorkspace report={analysis} /> : null}
                {analysis ? <DuriSuggestionCard suggestion={analysis.suggestion} onApply={applySuggestion} /> : null}
              </>
            ) : null}
            {activeTab === "candidates" ? <CandidateBoardPanel candidates={filteredCandidates} schedule={scheduleViews} tripStartDate={trip.startDate} onAddPlace={addCandidateToSchedule} /> : null}
            {activeTab === "analysis" && analysis ? (
              <><DuriAnalysisWorkspace report={analysis} mode="full" /><DuriSuggestionCard suggestion={analysis.suggestion} onApply={applySuggestion} /></>
            ) : null}
          </section>
        </div>
        <CandidateBottomSheet expanded={sheetExpanded} onToggle={() => setSheetExpanded((value) => !value)} filters={candidateFilters} activeFilter={activeFilter} onFilterChange={setActiveFilter} candidates={filteredCandidates} schedule={scheduleViews} tripStartDate={trip.startDate} selectedDay={activeDay} onAddPlace={addCandidateToSchedule} />
        <BottomTabBar tabs={bottomTabs} variant="compact" />
      </div>
    </main>
  );
}
