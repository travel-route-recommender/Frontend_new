import { DragDropProvider, DragOverlay, PointerSensor } from "@dnd-kit/react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActionToast } from "./ActionToast";
import { BottomTabBar } from "./BottomTabBar";
import { CandidateBoardPanel } from "./CandidateBoardPanel";
import { CandidateBottomSheet } from "./CandidateBottomSheet";
import type { CandidateSheetState } from "./CandidateBottomSheet";
import { DuriAnalysisWorkspace } from "./DuriAnalysisWorkspace";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { ScheduleEditorSheet } from "./ScheduleEditorSheet";
import type { ScheduleEditorValue } from "./ScheduleEditorSheet";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceScheduleGrid } from "./WorkspaceScheduleGrid";
import { WorkspaceSegmentTabs } from "./WorkspaceSegmentTabs";
import { WorkspaceStatsStrip } from "./WorkspaceStatsStrip";
import { bottomTabs, candidateFilters, workspaceTabs } from "../data/workspace";
import type { FilterKey, WorkspaceTab } from "../data/workspace";
import { DEFAULT_PLACE_DURATION_MINUTES, WORKSPACE_START_MINUTES } from "../data/workspaceSchedule";
import type { ItineraryItem } from "../domain";
import type { AnalysisIssue } from "../features/duri-analysis";
import { selectTripAnalysis } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import type { ItineraryMutationResult } from "../store/useDuriStore";
import {
  findNextAvailableSlot,
  findOverlappingItem,
  formatScheduleDate,
  getTripDates,
  minutesToTimeString,
} from "../utils/schedule";
import type { CandidateView, ItineraryView } from "./workspaceViewModels";
import type { WorkspaceDragData, WorkspaceDropData } from "./workspaceDnd";

type EditorState =
  | { mode: "add"; candidate: CandidateView; initialValue: ScheduleEditorValue }
  | { mode: "edit"; view: ItineraryView; initialValue: ScheduleEditorValue };

const pointerSensor = PointerSensor.configure({
  activationConstraints: (event) => [
    event.pointerType === "touch"
      ? new PointerActivationConstraints.Delay({ value: 240, tolerance: 7 })
      : new PointerActivationConstraints.Distance({ value: 6 }),
  ],
  preventActivation: (event) => event.target instanceof Element && Boolean(event.target.closest("[data-no-drag]")),
});

export function DuriWorkspaceScreen({ tripId }: { tripId: string }) {
  const trip = useDuriStore((state) => state.tripsById[tripId]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("schedule");
  const [activeDate, setActiveDate] = useState(trip?.startDate ?? "");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");
  const [candidateSheetState, setCandidateSheetState] = useState<CandidateSheetState>("collapsed");
  const [toast, setToast] = useState("현재 일정표를 날짜와 시간 기준으로 편집할 수 있어요.");
  const [highlightedMetric, setHighlightedMetric] = useState<string>();
  const [editor, setEditor] = useState<EditorState>();
  const [activeDrag, setActiveDrag] = useState<WorkspaceDragData>();
  const [collisionItemId, setCollisionItemId] = useState<string>();
  const [analysisItemIds, setAnalysisItemIds] = useState<string[]>([]);
  const [analysisFocus, setAnalysisFocus] = useState<{ itemId: string; date: string; startTime: string; token: number }>();
  const sheetBeforeDrag = useRef<CandidateSheetState>("half");
  const collisionTimer = useRef<number | undefined>(undefined);
  const analysisTimer = useRef<number | undefined>(undefined);

  const usersById = useDuriStore((state) => state.usersById);
  const regionsById = useDuriStore((state) => state.regionsById);
  const placesById = useDuriStore((state) => state.placesById);
  const candidates = useDuriStore((state) => state.candidatesByTripId[tripId]);
  const itinerary = useDuriStore((state) => state.itineraryByTripId[tripId]);
  const preferenceResultsByUserId = useDuriStore((state) => state.preferenceResultsByUserId);
  const currentUserId = useDuriStore((state) => state.currentUserId);
  const addPlaceToItinerary = useDuriStore((state) => state.addPlaceToItinerary);
  const updateItineraryItem = useDuriStore((state) => state.updateItineraryItem);
  const removeItineraryItem = useDuriStore((state) => state.removeItineraryItem);

  const tripDates = useMemo(() => (trip ? getTripDates(trip.startDate, trip.endDate) : []), [trip]);
  useEffect(() => {
    if (!tripDates.includes(activeDate)) setActiveDate(tripDates[0] ?? "");
  }, [activeDate, tripDates]);
  useEffect(() => {
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => () => {
    if (collisionTimer.current) window.clearTimeout(collisionTimer.current);
    if (analysisTimer.current) window.clearTimeout(analysisTimer.current);
  }, []);

  const companions = useMemo(
    () => trip?.members.flatMap((member) => (usersById[member.userId] ? [usersById[member.userId]] : [])) ?? [],
    [trip, usersById],
  );
  const candidateViews = useMemo<CandidateView[]>(
    () =>
      (candidates ?? []).flatMap((candidate) => {
        const place = placesById[candidate.placeId];
        if (!place) return [];
        return [{ candidate, place, addedByUsers: candidate.addedByUserIds.flatMap((userId) => (usersById[userId] ? [usersById[userId]] : [])) }];
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
  const analysis = useMemo(
    () =>
      selectTripAnalysis(
        {
          ...useDuriStore.getState(),
          usersById,
          placesById,
          candidatesByTripId: { ...useDuriStore.getState().candidatesByTripId, [tripId]: candidates ?? [] },
          itineraryByTripId: { ...useDuriStore.getState().itineraryByTripId, [tripId]: itinerary ?? [] },
          preferenceResultsByUserId,
        },
        tripId,
      ),
    [candidates, itinerary, placesById, preferenceResultsByUserId, tripId, trip, usersById],
  );
  const scheduledPlaceIds = useMemo(() => new Set((itinerary ?? []).flatMap((item) => (item.placeId ? [item.placeId] : []))), [itinerary]);
  const scheduledPlaces = candidateViews.filter((view) => scheduledPlaceIds.has(view.place.id)).length;
  const totalCandidates = candidateViews.length;
  const unplannedPlaces = Math.max(totalCandidates - scheduledPlaces, 0);
  const completedPreferences = trip?.members.filter((member) => member.preferenceStatus === "completed").length ?? 0;
  const readOnly = !trip || trip.status === "completed" || !trip.members.some((member) => member.userId === currentUserId);

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

  const showConflict = (range: Pick<ItineraryItem, "date" | "startTime" | "durationMinutes">, excludeItemId?: string) => {
    const overlapping = findOverlappingItem(itinerary ?? [], range, excludeItemId);
    setCollisionItemId(overlapping?.id);
    if (collisionTimer.current) window.clearTimeout(collisionTimer.current);
    collisionTimer.current = window.setTimeout(() => setCollisionItemId(undefined), 1500);
    const next = findNextAvailableSlot({ items: itinerary ?? [], date: range.date, durationMinutes: range.durationMinutes, fromMinutes: WORKSPACE_START_MINUTES, excludeItemId });
    setToast(next ? `이미 일정이 있는 시간이에요. ${next}에 배치할 수 있어요.` : "이미 일정이 있는 시간이에요.");
  };

  const openQuickAdd = (candidate: CandidateView) => {
    if (readOnly) {
      setToast("완료된 여행방의 일정은 수정할 수 없어요.");
      return;
    }
    if (!activeDate) {
      setToast("여행 날짜를 확인할 수 없어요.");
      return;
    }
    const startTime = findNextAvailableSlot({ items: itinerary ?? [], date: activeDate, durationMinutes: DEFAULT_PLACE_DURATION_MINUTES }) ?? minutesToTimeString(WORKSPACE_START_MINUTES);
    setEditor({
      mode: "add",
      candidate,
      initialValue: { date: activeDate, startTime, durationMinutes: DEFAULT_PLACE_DURATION_MINUTES, note: "" },
    });
  };

  const openEdit = (view: ItineraryView) => {
    if (readOnly) {
      setToast("완료된 여행방의 일정은 수정할 수 없어요.");
      return;
    }
    setEditor({
      mode: "edit",
      view,
      initialValue: {
        date: view.item.date,
        startTime: view.item.startTime,
        durationMinutes: view.item.durationMinutes,
        note: view.item.note ?? "",
      },
    });
  };

  const saveEditor = (value: ScheduleEditorValue): ItineraryMutationResult => {
    if (!editor) return "invalid-item";
    if (editor.mode === "add") {
      const result = addPlaceToItinerary({
        tripId,
        placeId: editor.candidate.place.id,
        date: value.date,
        startTime: value.startTime,
        durationMinutes: value.durationMinutes,
        preferredByUserIds: editor.candidate.candidate.addedByUserIds,
      });
      if (result === "success") {
        if (value.note) {
          const created = useDuriStore.getState().itineraryByTripId[tripId]?.find((item) => item.placeId === editor.candidate.place.id);
          if (created) updateItineraryItem(tripId, created.id, { note: value.note });
        }
        setActiveDate(value.date);
        setHighlightedMetric("일정 반영");
        setCandidateSheetState("half");
        setToast(`${editor.candidate.place.name}을 ${formatScheduleDate(value.date, tripDates.indexOf(value.date)).dayLabel} ${value.startTime}에 추가했어요.`);
      } else if (result === "overlap") showConflict(value);
      return result;
    }
    const result = updateItineraryItem(tripId, editor.view.item.id, value);
    if (result === "success") {
      setActiveDate(value.date);
      setToast("일정 변경을 저장했어요.");
    } else if (result === "overlap") showConflict(value, editor.view.item.id);
    return result;
  };

  const deleteEditor = (): ItineraryMutationResult => {
    if (!editor || editor.mode !== "edit") return "invalid-item";
    const name = editor.view.place?.name ?? editor.view.item.note ?? "일정";
    const result = removeItineraryItem(tripId, editor.view.item.id);
    if (result === "success") {
      setHighlightedMetric("미배치");
      setToast(`${name} 일정을 삭제했어요. 후보 장소는 그대로 남아 있어요.`);
    }
    return result;
  };

  const resizeItem = (item: ItineraryItem, durationMinutes: number) => {
    const result = updateItineraryItem(tripId, item.id, { durationMinutes });
    if (result === "success") setToast(`체류시간을 ${durationMinutes}분으로 변경했어요.`);
    else if (result === "overlap") showConflict({ ...item, durationMinutes }, item.id);
    else setToast("체류시간을 변경할 수 없어요.");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.operation.source?.data as WorkspaceDragData | undefined;
    if (!data) return;
    sheetBeforeDrag.current = candidateSheetState;
    setActiveDrag(data);
    if (data.kind === "candidate") setCandidateSheetState("collapsed");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const source = event.operation.source?.data as WorkspaceDragData | undefined;
    const target = event.operation.target?.data as WorkspaceDropData | undefined;
    setActiveDrag(undefined);
    if (source?.kind === "candidate") setCandidateSheetState(event.canceled ? sheetBeforeDrag.current : "half");
    if (event.canceled || !source || target?.kind !== "slot") return;

    if (source.kind === "candidate") {
      const candidate = candidateViews.find((view) => view.place.id === source.placeId);
      if (!candidate) return;
      const result = addPlaceToItinerary({
        tripId,
        placeId: candidate.place.id,
        date: target.date,
        startTime: target.startTime,
        durationMinutes: DEFAULT_PLACE_DURATION_MINUTES,
        preferredByUserIds: candidate.candidate.addedByUserIds,
      });
      if (result === "success") {
        setActiveDate(target.date);
        setHighlightedMetric("일정 반영");
        setToast(`${candidate.place.name}을 ${target.startTime}에 배치했어요.`);
      } else if (result === "overlap") showConflict({ date: target.date, startTime: target.startTime, durationMinutes: DEFAULT_PLACE_DURATION_MINUTES });
      else if (result === "duplicate-place") setToast("이미 일정에 배치된 장소예요.");
      else setToast("이 슬롯에는 장소를 배치할 수 없어요.");
      return;
    }

    const item = (itinerary ?? []).find((entry) => entry.id === source.itemId);
    if (!item) return;
    const result = updateItineraryItem(tripId, item.id, { date: target.date, startTime: target.startTime });
    if (result === "success") {
      const dateIndex = tripDates.indexOf(target.date);
      setActiveDate(target.date);
      setToast(`일정을 ${formatScheduleDate(target.date, dateIndex).dayLabel} ${target.startTime}로 옮겼어요.`);
    } else if (result === "overlap") showConflict({ ...item, date: target.date, startTime: target.startTime }, item.id);
    else setToast("이 슬롯으로 일정을 옮길 수 없어요.");
  };

  const viewAnalysisIssue = (issue: AnalysisIssue) => {
    const targetItem = (itinerary ?? []).find((item) => issue.affectedItemIds.includes(item.id));
    if (!targetItem) return;
    setCandidateSheetState("collapsed");
    setActiveDate(issue.date ?? targetItem.date);
    setAnalysisItemIds(issue.affectedItemIds);
    setAnalysisFocus({ itemId: targetItem.id, date: targetItem.date, startTime: targetItem.startTime, token: Date.now() });
    setActiveTab("schedule");
    if (analysisTimer.current) window.clearTimeout(analysisTimer.current);
    analysisTimer.current = window.setTimeout(() => setAnalysisItemIds([]), 1800);
  };

  return (
    <DragDropProvider
      sensors={(defaults) => [...defaults.filter((sensor) => sensor !== PointerSensor), pointerSensor]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="h-screen overflow-hidden bg-[#D5E6FF] px-3 py-3 text-[#243C8F]">
        <div className="relative mx-auto flex h-[calc(100vh-24px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[42px] bg-[#EFF5FF] shadow-2xl shadow-[#7897D8]/35">
          <div className="shrink-0 space-y-2 px-4 pt-3">
            <PhoneStatusBar />
            <WorkspaceHeader room={trip} companions={companions} regionName={regionsById[trip.regionId]?.name ?? "지역 미정"} onOpenAnalysis={() => { setCandidateSheetState("collapsed"); setActiveTab("analysis"); }} />
            <WorkspaceSegmentTabs tabs={workspaceTabs} activeTab={activeTab} onChange={(tab) => { setCandidateSheetState("collapsed"); setActiveTab(tab); }} />
            {activeTab === "schedule" ? <WorkspaceStatsStrip metrics={dashboardMetrics} highlightLabel={highlightedMetric} /> : null}
          </div>

          <div className="min-h-0 flex-1 px-4 pb-[174px] pt-2">
            {activeTab === "schedule" ? (
              <WorkspaceScheduleGrid tripDates={tripDates} activeDate={activeDate} items={scheduleViews} collisionItemId={collisionItemId} highlightedItemIds={analysisItemIds} focusTarget={analysisFocus} readOnly={readOnly} onSelectDate={setActiveDate} onOpenItem={openEdit} onResizeItem={resizeItem} />
            ) : null}
            {activeTab === "candidates" ? (
              <div className="h-full overflow-y-auto pb-6 no-scrollbar"><CandidateBoardPanel candidates={filteredCandidates} schedule={scheduleViews} tripStartDate={trip.startDate} onAddPlace={openQuickAdd} /></div>
            ) : null}
            {activeTab === "analysis" ? (
              <div className="h-full overflow-y-auto pb-6 no-scrollbar">
                {analysis ? <DuriAnalysisWorkspace report={analysis} mode="full" onViewIssue={viewAnalysisIssue} onOpenCandidates={() => { setActiveTab("schedule"); setCandidateSheetState("half"); }} /> : null}
              </div>
            ) : null}
          </div>

          <CandidateBottomSheet state={candidateSheetState} filters={candidateFilters} activeFilter={activeFilter} candidates={filteredCandidates} schedule={scheduleViews} tripDates={tripDates} unplannedCount={unplannedPlaces} dragDisabled={readOnly} onStateChange={setCandidateSheetState} onFilterChange={setActiveFilter} onQuickAdd={openQuickAdd} />
          <BottomTabBar tabs={bottomTabs} variant="compact" />
          {editor ? (
            <ScheduleEditorSheet
              mode={editor.mode}
              title={editor.mode === "add" ? editor.candidate.place.name : editor.view.place?.name ?? editor.view.item.note ?? "일정 편집"}
              subtitle={editor.mode === "add" ? `${editor.candidate.place.category} · ${editor.candidate.place.tags.slice(0, 2).join(" · ")}` : "날짜, 시작 시간, 체류시간을 변경할 수 있어요."}
              tripDates={tripDates}
              initialValue={editor.initialValue}
              onClose={() => setEditor(undefined)}
              onSave={saveEditor}
              onDelete={editor.mode === "edit" ? deleteEditor : undefined}
            />
          ) : null}
          <ActionToast message={toast} />
          <DragOverlay dropAnimation={{ duration: 140, easing: "ease-out" }}>
            {activeDrag ? <div className="rounded-[16px] bg-[#243C8F] px-4 py-3 text-[12px] font-black text-white shadow-xl">{activeDrag.name}<span className="ml-2 text-[#A9D0FF]">시간표에 놓기</span></div> : null}
          </DragOverlay>
        </div>
      </main>
    </DragDropProvider>
  );
}
