import { Bookmark, Compass, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import type { EntityId, Place } from "../domain";
import {
  selectActiveTripForCurrentUser,
  selectEligibleTripsForCandidate,
  selectIsPlaceSavedByCurrentUser,
  selectSavedPlaceCountForCurrentUser,
  selectSavedPlacesForCurrentUser,
} from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { ActionToast } from "./ActionToast";
import { PlaceCard } from "./PlaceCard";
import { TripSelectionSheet } from "./TripSelectionSheet";

type ToastState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const ALL_CATEGORIES = "전체";

const normalizeSearchValue = (value: string) => value.trim().toLowerCase();

function matchesSearch(place: Place, query: string) {
  if (!query) return true;
  const tags = Array.isArray(place.tags) ? place.tags : [];
  return [place.name, place.address, place.category, place.summary, ...tags]
    .some((value) => normalizeSearchValue(value ?? "").includes(query));
}

export function SavedPlacesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [selectedPlaceId, setSelectedPlaceId] = useState<EntityId>();
  const [toast, setToast] = useState<ToastState>();
  const savedPlaces = useDuriStore(useShallow(selectSavedPlacesForCurrentUser));
  const savedCount = useDuriStore(selectSavedPlaceCountForCurrentUser);
  const activeTrip = useDuriStore(selectActiveTripForCurrentUser);
  const eligibleTrips = useDuriStore(useShallow(selectEligibleTripsForCandidate));
  const regionsById = useDuriStore((state) => state.regionsById);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const itineraryByTripId = useDuriStore((state) => state.itineraryByTripId);
  const toggleSavedPlace = useDuriStore((state) => state.toggleSavedPlace);
  const addCandidatePlace = useDuriStore((state) => state.addCandidatePlace);
  const setActiveTrip = useDuriStore((state) => state.setActiveTrip);

  const categories = useMemo(
    () => [...new Set(savedPlaces.map((place) => place.category || "기타"))],
    [savedPlaces],
  );
  const normalizedQuery = normalizeSearchValue(query);
  const filteredPlaces = useMemo(
    () => savedPlaces.filter((place) =>
      (category === ALL_CATEGORIES || (place.category || "기타") === category) && matchesSearch(place, normalizedQuery)),
    [category, normalizedQuery, savedPlaces],
  );
  const eligibleActiveTrip = activeTrip && eligibleTrips.some((trip) => trip.id === activeTrip.id)
    ? activeTrip
    : undefined;
  const directTargetTrip = eligibleActiveTrip ?? (eligibleTrips.length === 1 ? eligibleTrips[0] : undefined);
  const activeCandidatePlaceIds = useMemo(
    () => new Set(eligibleActiveTrip ? (candidatesByTripId[eligibleActiveTrip.id] ?? []).map((candidate) => candidate.placeId) : []),
    [candidatesByTripId, eligibleActiveTrip],
  );
  const activeScheduledPlaceIds = useMemo(
    () => new Set(eligibleActiveTrip ? (itineraryByTripId[eligibleActiveTrip.id] ?? []).flatMap((item) => item.placeId ? [item.placeId] : []) : []),
    [eligibleActiveTrip, itineraryByTripId],
  );
  const selectedPlace = selectedPlaceId ? savedPlaces.find((place) => place.id === selectedPlaceId) : undefined;
  const selectedCandidateTripIds = useMemo(
    () => new Set(eligibleTrips.flatMap((trip) =>
      (candidatesByTripId[trip.id] ?? []).some((candidate) => candidate.placeId === selectedPlaceId) ? [trip.id] : [])),
    [candidatesByTripId, eligibleTrips, selectedPlaceId],
  );

  useEffect(() => {
    if (category !== ALL_CATEGORIES && !categories.includes(category)) setCategory(ALL_CATEGORIES);
  }, [categories, category]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(undefined), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleToggleSaved = (place: Place) => {
    const wasSaved = selectIsPlaceSavedByCurrentUser(useDuriStore.getState(), place.id);
    toggleSavedPlace(place.id);
    if (!wasSaved) {
      setToast({ message: "저장한 장소에 추가했어요." });
      return;
    }
    setToast({
      message: "저장을 해제했어요.",
      actionLabel: "실행 취소",
      onAction: () => {
        if (!selectIsPlaceSavedByCurrentUser(useDuriStore.getState(), place.id)) toggleSavedPlace(place.id);
        setToast({ message: "다시 저장했어요." });
      },
    });
  };

  const addPlaceToTrip = (tripId: EntityId) => {
    if (!selectedPlace) return;
    const trip = eligibleTrips.find((item) => item.id === tripId);
    if (!trip) {
      setToast({ message: "이 여행방에는 장소를 담을 수 없어요." });
      return;
    }
    if (selectedCandidateTripIds.has(tripId)) {
      setToast({ message: "이미 이 여행방에 담긴 장소예요." });
      return;
    }
    const result = addCandidatePlace(tripId, selectedPlace.id);
    if (result === "added") {
      setActiveTrip(tripId);
      setSelectedPlaceId(undefined);
      setToast({ message: `${trip.title} 후보 장소에 담았어요.` });
      return;
    }
    setToast({ message: result === "already-exists" ? "이미 이 여행방에 담긴 장소예요." : "이 여행방에는 장소를 담을 수 없어요." });
  };

  const handleAddToTrip = (place: Place) => {
    setSelectedPlaceId(place.id);
    if (directTargetTrip) {
      const alreadyCandidate = (candidatesByTripId[directTargetTrip.id] ?? []).some((candidate) => candidate.placeId === place.id);
      if (alreadyCandidate) {
        setToast({ message: "이미 이 여행방에 담긴 장소예요." });
        return;
      }
      const result = addCandidatePlace(directTargetTrip.id, place.id);
      if (result === "added") {
        setActiveTrip(directTargetTrip.id);
        setSelectedPlaceId(undefined);
        setToast({ message: `${directTargetTrip.title} 후보 장소에 담았어요.` });
        return;
      }
      setToast({ message: result === "already-exists" ? "이미 이 여행방에 담긴 장소예요." : "이 여행방에는 장소를 담을 수 없어요." });
    }
  };

  return (
    <div className="min-w-0 px-4 pb-32 pt-2">
      <header className="overflow-hidden rounded-[28px] bg-[#4388FF] px-5 py-6 text-white shadow-[0_12px_24px_rgba(67,136,255,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-black text-[#D6E8FF]">내 여행지</p>
            <h1 className="mt-1 text-[27px] font-black leading-tight">저장한 장소</h1>
            <p className="mt-2 text-[13px] font-bold leading-5 text-[#DDEBFF]">마음에 든 장소를 다시 보고 여행 후보로 담아보세요.</p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-white/18">
            <Bookmark size={27} />
          </span>
        </div>
        <p className="mt-5 text-[13px] font-black text-white">저장한 장소 {savedCount}곳</p>
      </header>

      {savedCount === 0 ? (
        <section className="mt-5 rounded-[26px] bg-white px-6 py-10 text-center shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
          <Bookmark size={28} className="mx-auto text-[#91BFF5]" />
          <h2 className="mt-4 text-[18px] font-black text-[#243C8F]">아직 저장한 장소가 없어요.</h2>
          <p className="mt-2 text-[12px] font-bold leading-5 text-[#8CAADA]">마음에 드는 장소를 저장해두고 여행을 준비할 때 다시 확인해보세요.</p>
          <Link to="/explore" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white">
            <Compass size={17} />장소 둘러보기
          </Link>
        </section>
      ) : (
        <>
          <section className="sticky top-0 z-10 -mx-4 mt-4 bg-[#EFF5FF]/95 px-4 pb-3 pt-2 backdrop-blur">
            <label className="flex h-12 items-center gap-2 rounded-[18px] bg-white px-4 shadow-[0_6px_14px_rgba(79,134,247,0.08)]">
              <Search size={18} className="shrink-0 text-[#91BFF5]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="저장한 장소 검색"
                aria-label="저장한 장소 검색"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-black text-[#243C8F] outline-none placeholder:text-[#B5CDEE]"
              />
            </label>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 no-scrollbar">
              {[ALL_CATEGORIES, ...categories].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`min-h-10 shrink-0 rounded-full px-4 text-[12px] font-black ${category === item ? "bg-[#4388FF] text-white" : "bg-white text-[#6B8BC8]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-3">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[12px] font-black text-[#7FADED]">Saved places</p>
                <h2 className="text-[21px] font-black text-[#243C8F]">다시 보고 싶은 장소</h2>
              </div>
              <p className="shrink-0 text-[11px] font-black text-[#9CB7DD]">{filteredPlaces.length}곳</p>
            </div>

            {filteredPlaces.length ? (
              <div className="space-y-4">
                {filteredPlaces.map((place) => {
                  const activeCandidate = activeCandidatePlaceIds.has(place.id);
                  const scheduled = activeScheduledPlaceIds.has(place.id);
                  const directCandidate = directTargetTrip
                    ? (candidatesByTripId[directTargetTrip.id] ?? []).some((candidate) => candidate.placeId === place.id)
                    : false;
                  const tripActionLabel = directCandidate
                    ? scheduled && directTargetTrip?.id === eligibleActiveTrip?.id ? "일정에 반영됨" : "후보에 담김"
                    : eligibleTrips.length > 1 && !eligibleActiveTrip
                      ? "여행방 선택"
                      : eligibleTrips.length === 0
                        ? "여행방 만들고 담기"
                        : `${directTargetTrip?.title ?? "여행방"} 후보에 담기`;
                  return (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      saved
                      variant="saved"
                      candidateStatus={activeCandidate ? (scheduled ? "일정 반영" : "후보에 담김") : undefined}
                      tripActionLabel={tripActionLabel}
                      tripActionDisabled={directCandidate}
                      onToggleSaved={() => handleToggleSaved(place)}
                      onAddToTrip={() => handleAddToTrip(place)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] bg-white px-5 py-9 text-center shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
                <Search size={24} className="mx-auto text-[#91BFF5]" />
                <h3 className="mt-3 text-[16px] font-black text-[#243C8F]">조건에 맞는 저장 장소가 없어요.</h3>
                <p className="mt-1 text-[12px] font-bold text-[#8CAADA]">검색어나 카테고리를 바꿔보세요.</p>
                <button type="button" onClick={() => { setQuery(""); setCategory(ALL_CATEGORIES); }} className="mt-4 min-h-11 rounded-full bg-[#EAF3FF] px-5 text-[12px] font-black text-[#4388FF]">조건 초기화</button>
              </div>
            )}
          </section>
        </>
      )}

      {selectedPlace ? (
        <TripSelectionSheet
          trips={eligibleTrips}
          regionsById={regionsById}
          candidateTripIds={selectedCandidateTripIds}
          onClose={() => setSelectedPlaceId(undefined)}
          onSelect={addPlaceToTrip}
        />
      ) : null}
      <ActionToast message={toast?.message} actionLabel={toast?.actionLabel} onAction={toast?.onAction} />
    </div>
  );
}
