import { Compass, Home, Layers3, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type WorkspaceTab = "schedule" | "candidates" | "analysis";
export type DayKey = "Day 1" | "Day 2" | "전체";
export type FilterKey = "전체" | "공통 관심" | "내가 담은 장소" | "동행자가 담은 장소" | "두리 추천" | "미배치";

export type Companion = {
  name: string;
  initial: string;
  tone: string;
};

export type ScheduledPlace = {
  id: string;
  sourcePlaceId: string;
  day: Exclude<DayKey, "전체">;
  time: string;
  timeLabel: string;
  name: string;
  category: string;
  tags: string[];
  duration: string;
  preferredBy: string[];
};

export type CandidatePlace = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  addedBy: string[];
  recommended?: boolean;
};

export type BottomTab = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export const workspaceRoom = {
  title: "부산 1박 2일 여행",
  date: "7.18 - 7.19",
  status: "일정 초안 편집 중",
  companions: [
    { name: "수민", initial: "수", tone: "bg-[#4F86F7] text-white" },
    { name: "지윤", initial: "지", tone: "bg-[#DCEBFF] text-[#376DCE]" },
    { name: "민재", initial: "민", tone: "bg-white text-[#243F93]" },
  ] satisfies Companion[],
};

export const workspaceTabs: Array<{ key: WorkspaceTab; label: string }> = [
  { key: "schedule", label: "현재 일정" },
  { key: "candidates", label: "후보 장소" },
  { key: "analysis", label: "두리 분석" },
];

export const dayTabs: DayKey[] = ["Day 1", "Day 2", "전체"];

export const candidateFilters: FilterKey[] = [
  "전체",
  "공통 관심",
  "내가 담은 장소",
  "동행자가 담은 장소",
  "두리 추천",
  "미배치",
];

export const initialSchedule: ScheduledPlace[] = [
  {
    id: "schedule-jeonpo-day1",
    sourcePlaceId: "jeonpo",
    day: "Day 1",
    time: "11:00",
    timeLabel: "오전",
    name: "전포카페거리",
    category: "카페",
    tags: ["카페", "감성", "여유"],
    duration: "1시간 30분",
    preferredBy: ["수민", "지윤"],
  },
  {
    id: "schedule-gamcheon-day1",
    sourcePlaceId: "gamcheon",
    day: "Day 1",
    time: "14:00",
    timeLabel: "오후",
    name: "감천문화마을",
    category: "명소",
    tags: ["산책", "사진", "명소"],
    duration: "2시간",
    preferredBy: ["수민", "민재"],
  },
  {
    id: "schedule-gwangalli-day1",
    sourcePlaceId: "gwangalli",
    day: "Day 1",
    time: "18:30",
    timeLabel: "저녁",
    name: "광안리",
    category: "바다",
    tags: ["바다", "야경"],
    duration: "2시간",
    preferredBy: ["모두"],
  },
];

export const candidatePlaces: CandidatePlace[] = [
  {
    id: "huinnyeoul",
    name: "흰여울문화마을",
    category: "산책",
    tags: ["산책", "바다", "사진"],
    addedBy: ["지윤"],
    recommended: true,
  },
  {
    id: "gukje",
    name: "국제시장",
    category: "맛집",
    tags: ["맛집", "로컬"],
    addedBy: ["민재"],
    recommended: true,
  },
  {
    id: "haeundae",
    name: "해운대",
    category: "바다",
    tags: ["바다", "야간"],
    addedBy: ["수민"],
  },
  {
    id: "jeonpo",
    name: "전포카페거리",
    category: "카페",
    tags: ["카페", "감성"],
    addedBy: ["수민", "지윤"],
  },
  {
    id: "gamcheon",
    name: "감천문화마을",
    category: "명소",
    tags: ["산책", "명소"],
    addedBy: ["수민", "민재"],
  },
  {
    id: "gwangalli",
    name: "광안리",
    category: "바다",
    tags: ["바다", "야경"],
    addedBy: ["모두"],
  },
];

export const workspaceMetrics = [
  { label: "후보 장소", value: "8개" },
  { label: "일정 반영", value: "3개" },
  { label: "미배치", value: "5개" },
  { label: "성향 진단", value: "2/3" },
];

export const analysisReport = {
  matchRate: 78,
  commonPreferences: ["감성 산책", "카페", "바다"],
  needsTune: ["일정 밀도", "야간 활동 선호"],
  routeWarning: "감천문화마을 다음 광안리는 이동 시간이 길 수 있어요.",
  unplannedCandidate: "국제시장이 아직 일정에 반영되지 않았어요.",
  suggestion:
    "Day 1의 이동 거리가 조금 길어요. 감천문화마을을 Day 2 오전으로 옮기면 동선이 더 자연스러워요.",
};

export const bottomTabs: BottomTab[] = [
  { label: "홈", icon: Home },
  { label: "탐색", icon: Compass },
  { label: "여행방", icon: Layers3, active: true },
  { label: "마이페이지", icon: UserRound },
];
