import { Compass, Home, Layers3, UserRound } from "lucide-react";
import type { BottomTab } from "../components/BottomTabBar";

export type WorkspaceTab = "schedule" | "candidates" | "analysis";
export type DayKey = "Day 1" | "Day 2" | "전체";
export type FilterKey = "전체" | "공통 관심" | "내가 담은 장소" | "동행자가 담은 장소" | "두리 추천" | "미배치";

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

export const bottomTabs: BottomTab[] = [
  { label: "홈", icon: Home, to: "/" },
  { label: "탐색", icon: Compass, to: "/explore" },
  { label: "여행방", icon: Layers3, to: "/trips", active: true },
  { label: "마이페이지", icon: UserRound, to: "/mypage" },
];
