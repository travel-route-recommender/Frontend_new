import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ActionToast } from "../components/ActionToast";
import { DuriExploreListPage } from "../components/DuriExploreListPage";
import { DuriPlaceDetailSheet } from "../components/DuriPlaceDetailSheet";
import { TripSelectionSheet } from "../components/TripSelectionSheet";
import { selectActiveTripForCurrentUser, selectPlanningTripsForCurrentUser } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";

type PlaceRouteState = {
  fromDuri?: boolean;
};

export function PlaceDetailRoute() {
  const { placeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [tripSelectionOpen, setTripSelectionOpen] = useState(false);
  const [toast, setToast] = useState<string>();
  const place = useDuriStore((state) => (placeId ? state.placesById[placeId] : undefined));
  const activeTrip = useDuriStore(selectActiveTripForCurrentUser);
  const eligibleTrips = useDuriStore(useShallow(selectPlanningTripsForCurrentUser));
  const eligibleActiveTrip = activeTrip && eligibleTrips.some((trip) => trip.id === activeTrip.id) ? activeTrip : undefined;
  const regionsById = useDuriStore((state) => state.regionsById);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const usersById = useDuriStore((state) => state.usersById);
  const savedPlaceIds = useDuriStore((state) => state.savedPlaceIdsByUserId[state.currentUserId]);
  const toggleSavedPlace = useDuriStore((state) => state.toggleSavedPlace);
  const addCandidatePlace = useDuriStore((state) => state.addCandidatePlace);
  const setActiveTrip = useDuriStore((state) => state.setActiveTrip);
  const routeState = location.state as PlaceRouteState | null;
  const candidateTripIds = useMemo(
    () =>
      new Set(
        eligibleTrips.flatMap((trip) =>
          (candidatesByTripId[trip.id] ?? []).some((candidate) => candidate.placeId === placeId) ? [trip.id] : [],
        ),
      ),
    [candidatesByTripId, eligibleTrips, placeId],
  );
  const directTargetTrip = eligibleActiveTrip ?? (eligibleTrips.length === 1 ? eligibleTrips[0] : undefined);
  const activeCandidate = directTargetTrip
    ? (candidatesByTripId[directTargetTrip.id] ?? []).find((candidate) => candidate.placeId === placeId)
    : undefined;
  const saved = Boolean(place && (savedPlaceIds ?? []).includes(place.id));

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(undefined), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const closeSheet = () => {
    if (routeState?.fromDuri) {
      navigate(-1);
      return;
    }

    navigate("/explore");
  };

  const addPlaceToTrip = (tripId: string) => {
    const trip = eligibleTrips.find((item) => item.id === tripId);
    if (!trip || !place) {
      setToast("이 여행방에는 장소를 담을 수 없어요.");
      return;
    }
    if (candidateTripIds.has(trip.id)) {
      setToast("이미 이 여행방에 담긴 장소예요.");
      return;
    }

    const result = addCandidatePlace(trip.id, place.id);
    if (result === "added") {
      setActiveTrip(trip.id);
      setTripSelectionOpen(false);
      setToast(`${trip.title} 후보 장소에 담았어요.`);
      return;
    }
    if (result === "already-exists") {
      setToast("이미 이 여행방에 담긴 장소예요.");
      return;
    }
    setToast("이 여행방에는 장소를 담을 수 없어요.");
  };

  const handleAddToTrip = () => {
    if (!place) return;
    if (eligibleActiveTrip) {
      addPlaceToTrip(eligibleActiveTrip.id);
      return;
    }
    if (eligibleTrips.length === 1) {
      addPlaceToTrip(eligibleTrips[0].id);
      return;
    }
    setTripSelectionOpen(true);
  };

  const tripActionDisabled = Boolean(directTargetTrip && candidateTripIds.has(directTargetTrip.id));
  const tripActionLabel = directTargetTrip
    ? tripActionDisabled
      ? `${directTargetTrip.title}에 담긴 장소`
      : `${directTargetTrip.title} 후보에 담기`
    : eligibleTrips.length > 1
      ? "여행방 선택"
      : "여행방 만들고 담기";

  return (
    <>
      <DuriExploreListPage />
      {place ? (
        <DuriPlaceDetailSheet
          place={place}
          addedByNames={(activeCandidate?.addedByUserIds ?? []).flatMap((userId) => (usersById[userId] ? [usersById[userId].name] : []))}
          saved={saved}
          tripActionLabel={tripActionLabel}
          tripActionDisabled={tripActionDisabled}
          onClose={closeSheet}
          onToggleSaved={() => {
            toggleSavedPlace(place.id);
            setToast(saved ? "저장을 해제했어요." : "저장한 장소에 추가했어요.");
          }}
          onAddToTrip={handleAddToTrip}
        />
      ) : (
        <MissingPlaceSheet onClose={closeSheet} />
      )}
      {tripSelectionOpen && place ? (
        <TripSelectionSheet
          trips={eligibleTrips}
          regionsById={regionsById}
          candidateTripIds={candidateTripIds}
          onClose={() => setTripSelectionOpen(false)}
          onSelect={addPlaceToTrip}
        />
      ) : null}
      <ActionToast message={toast} />
    </>
  );
}

function MissingPlaceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-50 rounded-[32px] bg-white px-5 pb-5 pt-4 text-center shadow-[0_22px_44px_rgba(36,60,143,0.28)]">
      <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F1F6FF] text-[#243C8F]"
        aria-label="닫기"
      >
        <X size={19} />
      </button>
      <p className="text-[13px] font-black text-[#7FADED]">장소 없음</p>
      <h1 className="mt-2 text-[22px] font-black text-[#243C8F]">장소를 찾을 수 없어요</h1>
      <p className="mt-2 text-[13px] font-bold leading-5 text-[#7898CE]">목록에서 다른 후보 장소를 선택해 주세요.</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white"
      >
        탐색으로 돌아가기
      </button>
    </div>
  );
}
