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
import {
  analysisReport,
  bottomTabs,
  candidateFilters,
  candidatePlaces,
  dayTabs,
  initialSchedule,
  workspaceRoom,
  workspaceTabs,
} from "../data/workspace";
import type { CandidatePlace, DayKey, FilterKey, ScheduledPlace, WorkspaceTab } from "../data/workspace";

export function DuriWorkspaceScreen() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("schedule");
  const [activeDay, setActiveDay] = useState<DayKey>("Day 1");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState("현재 일정표를 수동으로 조정할 수 있어요.");
  const [highlightedMetric, setHighlightedMetric] = useState<string | undefined>();
  const [schedule, setSchedule] = useState<ScheduledPlace[]>(initialSchedule);

  const scheduledPlaces = new Set(schedule.map((item) => item.sourcePlaceId)).size;
  const totalCandidates = 8;
  const unplannedPlaces = Math.max(totalCandidates - scheduledPlaces, 0);

  const dashboardMetrics = useMemo(() => {
    return [
      { label: "후보 장소", value: `${totalCandidates}개` },
      { label: "일정 반영", value: `${scheduledPlaces}개` },
      { label: "미배치", value: `${unplannedPlaces}개` },
      { label: "성향 진단", value: "2/3" },
    ];
  }, [scheduledPlaces, unplannedPlaces]);

  const filteredCandidates = useMemo(() => {
    return candidatePlaces.filter((place) => {
      const scheduled = schedule.find((item) => item.sourcePlaceId === place.id);
      const addedByMe = place.addedBy.includes("수민");
      const addedByCompanion = !addedByMe || place.addedBy.includes("지윤") || place.addedBy.includes("민재");
      const commonInterest = place.addedBy.length > 1 || place.addedBy.includes("모두");

      if (activeFilter === "공통 관심") return commonInterest;
      if (activeFilter === "내가 담은 장소") return addedByMe;
      if (activeFilter === "동행자가 담은 장소") return addedByCompanion;
      if (activeFilter === "두리 추천") return Boolean(place.recommended);
      if (activeFilter === "미배치") return !scheduled;
      return true;
    });
  }, [activeFilter, schedule]);

  const addCandidateToSchedule = (place: CandidatePlace) => {
    const targetDay = activeDay === "전체" ? "Day 1" : activeDay;
    const alreadyScheduled = schedule.some((item) => item.sourcePlaceId === place.id);

    if (alreadyScheduled) {
      setToast(`${place.name}은 이미 일정에 배치되어 있어요.`);
      return;
    }

    const nextOrder = schedule.filter((item) => item.day === targetDay).length;
    const fallbackTimes = ["20:30", "10:30", "13:30", "16:30"];
    const nextItem: ScheduledPlace = {
      id: `schedule-${place.id}-${Date.now()}`,
      sourcePlaceId: place.id,
      day: targetDay,
      time: fallbackTimes[nextOrder] ?? "20:30",
      timeLabel: nextOrder > 1 ? "저녁" : "오후",
      name: place.name,
      category: place.category,
      tags: place.tags,
      duration: place.category === "맛집" ? "1시간" : "1시간 30분",
      preferredBy: place.addedBy,
    };

    setSchedule((current) => [...current, nextItem]);
    setSheetExpanded(false);
    setHighlightedMetric("일정 반영");
    setToast(`${place.name}이 여행 대시보드와 ${targetDay} 일정표에 바로 반영됐어요.`);
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
            <WorkspaceHeader room={workspaceRoom} />
            <WorkspaceSegmentTabs tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />
            <WorkspaceDashboardActions
              scheduledCount={scheduledPlaces}
              unplannedCount={unplannedPlaces}
              onSuggest={() => {
                setSheetExpanded(false);
                setActiveTab("analysis");
              }}
            />

            <div className="rounded-[24px] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(90,125,190,0.14)]">
              <p className="text-xs font-black text-[#4A86F7]">작업 상태</p>
              <p className="mt-1 text-[13px] font-bold leading-5 text-[#6F8AC2]">{toast}</p>
            </div>

            {activeTab === "schedule" ? (
              <>
                <WorkspaceStatsStrip metrics={dashboardMetrics} highlightLabel={highlightedMetric} />
                <DaySelector days={dayTabs} activeDay={activeDay} onChange={setActiveDay} />
                <ItineraryTimeline activeDay={activeDay} items={schedule} onOpenCandidates={openCandidateSheet} />
                <DuriAnalysisWorkspace report={analysisReport} />
                <DuriSuggestionCard suggestion={analysisReport.suggestion} onApply={applySuggestion} />
              </>
            ) : null}

            {activeTab === "candidates" ? (
              <CandidateBoardPanel candidates={filteredCandidates} schedule={schedule} onAddPlace={addCandidateToSchedule} />
            ) : null}

            {activeTab === "analysis" ? (
              <>
                <DuriAnalysisWorkspace report={analysisReport} mode="full" />
                <DuriSuggestionCard suggestion={analysisReport.suggestion} onApply={applySuggestion} />
              </>
            ) : null}
          </section>
        </div>

        <CandidateBottomSheet
          expanded={sheetExpanded}
          onToggle={() => setSheetExpanded((value) => !value)}
          filters={candidateFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          candidates={filteredCandidates}
          schedule={schedule}
          selectedDay={activeDay}
          onAddPlace={addCandidateToSchedule}
        />
        <BottomTabBar tabs={bottomTabs} variant="compact" />
      </div>
    </main>
  );
}
