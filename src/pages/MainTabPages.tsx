import { useParams } from "react-router-dom";
import { DuriWorkspaceScreen } from "../components/DuriWorkspaceScreen";
import { SimpleWorkspacePage } from "../components/SimpleWorkspacePage";
import { activeTrip } from "../data/travelPages";

export function TripsPage() {
  return (
    <SimpleWorkspacePage
      eyebrow="내 여행방"
      title={activeTrip.title}
      description={`${activeTrip.date} · ${activeTrip.status}`}
      primaryLabel="장소 탐색하기"
      secondaryLabel="새 여행방 만들기"
      icon="trip"
      primaryTo="/explore"
    />
  );
}

export function DuriPage() {
  return (
    <SimpleWorkspacePage
      eyebrow="두리"
      title="취향을 맞춰 일정 만들기"
      description="동행자 응답과 후보 장소를 비교해서 자연스러운 순서를 찾아요."
      primaryLabel="두리 제안 보기"
      secondaryLabel="취향 다시 보기"
      icon="duri"
      primaryTo="/trips"
    />
  );
}

export function SavedPage() {
  return (
    <SimpleWorkspacePage
      eyebrow="내 여행지"
      title="저장한 장소 6곳"
      description="부산 여행방에 담을 후보를 다시 확인해요."
      primaryLabel="지도에서 보기"
      secondaryLabel="장소 더 찾기"
      icon="saved"
      primaryTo="/explore/map"
    />
  );
}

export function MyPage() {
  return (
    <SimpleWorkspacePage
      eyebrow="마이페이지"
      title="수민님의 여행 취향"
      description="감성산책형 · 카페와 바다 코스를 선호해요."
      primaryLabel="테스트 다시 보기"
      secondaryLabel="프로필 편집"
      icon="profile"
      primaryTo="/duri"
    />
  );
}

export function TripWorkspaceRoute() {
  const { tripId } = useParams();

  return (
    <div data-trip-id={tripId ?? "unknown"}>
      <DuriWorkspaceScreen />
    </div>
  );
}
