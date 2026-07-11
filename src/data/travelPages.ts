export type Region = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  spots: number;
  weather: string;
  imageUrl: string;
};

export type TravelPlace = {
  id: string;
  name: string;
  region: string;
  category: string;
  tags: string[];
  rating: number;
  distance: string;
  imageUrl: string;
  saved: boolean;
  addedBy: string;
  roomStatus: "미배치" | "Day 1 배치됨" | "Day 2 배치됨";
  address: string;
  summary: string;
};

export const activeTrip = {
  title: "부산 1박 2일 여행",
  date: "7.18 - 7.19",
  companions: ["수민", "지윤", "민재"],
  candidateCount: 8,
  status: "일정 초안 작성 중",
  nextStep: "두리 추천을 받아볼 차례",
};

export const regions: Region[] = [
  {
    id: "jeju",
    name: "제주도",
    shortName: "제주",
    description: "바다와 오름을 천천히 둘러보는 여행",
    spots: 128,
    weather: "18도 맑음",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gyeongju",
    name: "경주",
    shortName: "경주",
    description: "걷기 좋은 골목과 유적 코스",
    spots: 84,
    weather: "21도 구름 조금",
    imageUrl: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gangwon",
    name: "강원도",
    shortName: "강원",
    description: "숲, 바다, 드라이브 코스",
    spots: 103,
    weather: "19도 선선함",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "busan",
    name: "부산",
    shortName: "부산",
    description: "카페, 바다, 야경을 같이 담는 도시",
    spots: 96,
    weather: "22도 맑음",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "jeonnam",
    name: "전라남도",
    shortName: "전남",
    description: "느긋한 남도 미식과 섬 여행",
    spots: 77,
    weather: "23도 맑음",
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
  },
];

export const featuredRegion = regions[0];

export const travelPlaces: TravelPlace[] = [
  {
    id: "gamcheon",
    name: "감천문화마을",
    region: "부산",
    category: "문화마을",
    tags: ["사진", "산책", "명소"],
    rating: 4.9,
    distance: "2.4km",
    imageUrl: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80",
    saved: true,
    addedBy: "수민, 민재",
    roomStatus: "Day 1 배치됨",
    address: "부산 사하구 감내2로 203",
    summary: "골목을 따라 천천히 걸으며 사진을 남기기 좋은 후보 장소예요.",
  },
  {
    id: "jeonpo",
    name: "전포카페거리",
    region: "부산",
    category: "카페",
    tags: ["감성", "카페", "여유"],
    rating: 4.8,
    distance: "1.1km",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    saved: false,
    addedBy: "수민, 지윤",
    roomStatus: "Day 1 배치됨",
    address: "부산 부산진구 전포대로209번길",
    summary: "취향이 다른 동행자도 무난하게 즐길 수 있는 카페 밀집 코스예요.",
  },
  {
    id: "gwangalli",
    name: "광안리",
    region: "부산",
    category: "바다",
    tags: ["야경", "바다"],
    rating: 4.8,
    distance: "3.2km",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    saved: true,
    addedBy: "모두",
    roomStatus: "Day 1 배치됨",
    address: "부산 수영구 광안해변로",
    summary: "저녁 일정에 넣으면 바다와 야경을 함께 챙길 수 있어요.",
  },
  {
    id: "gukje",
    name: "국제시장",
    region: "부산",
    category: "시장",
    tags: ["맛집", "로컬"],
    rating: 4.7,
    distance: "2.8km",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    saved: false,
    addedBy: "민재",
    roomStatus: "미배치",
    address: "부산 중구 신창동4가",
    summary: "맛집 집중형 동행자가 좋아할 만한 로컬 먹거리 후보예요.",
  },
  {
    id: "huinnyeoul",
    name: "흰여울문화마을",
    region: "부산",
    category: "산책",
    tags: ["바다", "사진"],
    rating: 4.6,
    distance: "4.5km",
    imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
    saved: false,
    addedBy: "지윤",
    roomStatus: "미배치",
    address: "부산 영도구 영선동4가",
    summary: "바다 옆 골목을 따라 걷는 코스로 감성 산책형에게 잘 맞아요.",
  },
  {
    id: "haeundae",
    name: "해운대",
    region: "부산",
    category: "해변",
    tags: ["바다", "야간"],
    rating: 4.7,
    distance: "5.6km",
    imageUrl: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=900&q=80",
    saved: false,
    addedBy: "수민",
    roomStatus: "미배치",
    address: "부산 해운대구 우동",
    summary: "일정 여유가 있을 때 넣기 좋은 대표 해변 후보예요.",
  },
];

export const exploreFilters = ["전체", "공통 관심", "내가 담은", "두리 추천", "카페", "야경"];

export const mapPins = [
  { placeId: "jeonpo", x: "50%", y: "36%" },
  { placeId: "gwangalli", x: "66%", y: "49%" },
  { placeId: "gamcheon", x: "37%", y: "57%" },
  { placeId: "gukje", x: "45%", y: "68%" },
  { placeId: "huinnyeoul", x: "25%", y: "72%" },
];
