import {
  BarChart3,
  Compass,
  Edit3,
  Flag,
  Home,
  Layers3,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Route,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Companion = {
  name: string;
  initial: string;
  tone: string;
};

export type PreparationStep = {
  title: string;
  description: string;
  status: "done" | "active" | "pending";
  statusLabel: string;
};

export type SummaryStat = {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
};

export type RoomQuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
};

export type CandidatePlace = {
  name: string;
  category: string;
  tags: string[];
  addedBy: string;
  state: "saved" | "candidate";
  tone: "mint" | "blue" | "sand" | "yellow";
};

export type DraftDay = {
  day: string;
  title: string;
  route: string[];
  note: string;
};

export type BottomTab = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export const roomSummary = {
  title: "부산 1박 2일 여행",
  region: "부산",
  date: "7.18 - 7.19",
  status: "일정 초안 작성 중",
  companions: [
    { name: "수민", initial: "수", tone: "bg-duri-green text-white" },
    { name: "지윤", initial: "지", tone: "bg-[#DCECF1] text-duri-blue" },
    { name: "민재", initial: "민", tone: "bg-duri-sand text-[#745A24]" },
  ] satisfies Companion[],
};

export const progressSummary = {
  percent: 60,
  label: "5단계 중 3단계 완료",
  message: "민재의 성향 진단을 기다리거나, 현재 응답 기준으로 두리 추천 일정을 만들 수 있어요.",
  cta: "두리 추천 받기",
};

export const preparationSteps: PreparationStep[] = [
  {
    title: "동행자 초대 완료",
    description: "수민, 지윤, 민재가 여행방에 참여했어요.",
    status: "done",
    statusLabel: "완료",
  },
  {
    title: "성향 진단 진행 중",
    description: "2명이 완료했고 민재의 응답을 기다리는 중이에요.",
    status: "active",
    statusLabel: "진행 중",
  },
  {
    title: "후보 장소 담기 진행 중",
    description: "현재 후보 장소 8개가 모였어요.",
    status: "active",
    statusLabel: "진행 중",
  },
  {
    title: "두리 추천 일정 생성 전",
    description: "응답 기준으로 초안을 만들 수 있어요.",
    status: "pending",
    statusLabel: "대기",
  },
  {
    title: "최종 일정 확정 전",
    description: "추천 일정 확인 후 확정하면 돼요.",
    status: "pending",
    statusLabel: "대기",
  },
];

export const stats: SummaryStat[] = [
  { label: "후보 장소", value: "8개", caption: "4개는 일정 후보", icon: MapPinned },
  { label: "동행자", value: "3명", caption: "모두 초대 완료", icon: UsersRound },
  { label: "성향 진단", value: "2/3", caption: "민재 응답 대기", icon: BarChart3 },
  { label: "일정 초안", value: "2일차", caption: "구성 중", icon: Route },
];

export const quickActions: RoomQuickAction[] = [
  { label: "장소 추가하기", description: "후보 보드에 담기", icon: Plus },
  { label: "두리 추천 받기", description: "응답 기준으로 생성", icon: Sparkles, primary: true },
  { label: "직접 편집하기", description: "Day별 동선 조정", icon: Pencil },
  { label: "최종 일정 보기", description: "확정 전 미리보기", icon: Flag },
];

export const candidatePlaces: CandidatePlace[] = [
  {
    name: "감천문화마을",
    category: "명소",
    tags: ["감성 산책", "사진 명소"],
    addedBy: "수민",
    state: "saved",
    tone: "mint",
  },
  {
    name: "전포카페거리",
    category: "카페",
    tags: ["카페", "여유"],
    addedBy: "지윤",
    state: "candidate",
    tone: "sand",
  },
  {
    name: "광안리",
    category: "바다",
    tags: ["야경", "바다"],
    addedBy: "수민",
    state: "saved",
    tone: "blue",
  },
  {
    name: "국제시장",
    category: "맛집",
    tags: ["맛집", "로컬"],
    addedBy: "민재",
    state: "candidate",
    tone: "yellow",
  },
];

export const draftSchedule: DraftDay[] = [
  {
    day: "Day 1",
    title: "카페와 바다 야경 중심",
    route: ["전포카페거리", "광안리"],
    note: "오후 도착 후 이동 부담을 낮춘 동선",
  },
  {
    day: "Day 2",
    title: "감성 산책과 로컬 맛집",
    route: ["감천문화마을", "국제시장"],
    note: "사진 명소와 식사 후보를 함께 배치",
  },
];

export const analysisSummary = {
  matchRate: 78,
  commonPreferences: ["감성 산책", "카페", "바다"],
  needsTune: ["일정 밀도", "야간 활동 선호"],
};

export const bottomTabs: BottomTab[] = [
  { label: "홈", icon: Home },
  { label: "탐색", icon: Compass },
  { label: "여행방", icon: Layers3, active: true },
  { label: "마이페이지", icon: UserRound },
];

export const roomIcons = {
  mapPin: MapPin,
  search: Search,
  edit: Edit3,
};
