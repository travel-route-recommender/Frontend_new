import {
  Bell,
  CalendarDays,
  Compass,
  Home,
  Layers3,
  Luggage,
  MapPinned,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  tone: "green" | "blue" | "sand" | "white";
};

export type PlacePreview = {
  name: string;
  category: string;
  tag: string;
  saved: boolean;
  tone: "mint" | "blue" | "sand" | "yellow";
};

export type BottomTab = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export const travelRoom = {
  title: "부산 1박 2일 여행",
  date: "7.18 - 7.19",
  companions: ["수민", "지윤", "민재"],
  stats: ["후보 장소 8개", "일정 초안 작성 중"],
  schedule: ["Day 1 전포카페거리 → 광안리", "Day 2 감천문화마을 → 국제시장"],
};

export const quickActions: QuickAction[] = [
  {
    label: "새 여행방 만들기",
    description: "동행자를 초대해요",
    icon: Plus,
    tone: "green",
  },
  {
    label: "장소 탐색하기",
    description: "후보 장소를 찾아요",
    icon: Search,
    tone: "blue",
  },
  {
    label: "두리 테스트 하기",
    description: "취향을 확인해요",
    icon: Sparkles,
    tone: "sand",
  },
  {
    label: "내 여행 보기",
    description: "지난 방을 모아봐요",
    icon: Luggage,
    tone: "white",
  },
];

export const testSummary = {
  type: "감성산책형",
  description: "여유로운 동선과 분위기 좋은 장소를 선호해요",
  traits: ["느린 동선", "풍경", "카페"],
};

export const placePreviews: PlacePreview[] = [
  {
    name: "감천문화마을",
    category: "명소",
    tag: "사진 찍기 좋은 언덕길",
    saved: true,
    tone: "mint",
  },
  {
    name: "전포카페거리",
    category: "카페",
    tag: "취향 다른 친구도 무난",
    saved: false,
    tone: "sand",
  },
  {
    name: "광안리",
    category: "야경",
    tag: "저녁 일정에 잘 맞음",
    saved: true,
    tone: "blue",
  },
  {
    name: "국제시장",
    category: "시장",
    tag: "맛집 집중형 추천",
    saved: false,
    tone: "yellow",
  },
];

export const bottomTabs: BottomTab[] = [
  { label: "홈", icon: Home, active: true },
  { label: "탐색", icon: Compass },
  { label: "여행방", icon: Layers3 },
  { label: "마이페이지", icon: UserRound },
];

export const headerActions = {
  alert: Bell,
  message: MessageCircle,
  map: MapPinned,
  calendar: CalendarDays,
};
