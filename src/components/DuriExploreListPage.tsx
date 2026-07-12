import { ArrowLeft, CalendarDays, Heart, LayoutGrid, Map as MapIcon, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Place } from "../domain";
import { exploreFilters } from "../data/travelPages";
import { selectActiveTripForCurrentUser, selectSavedPlaceIdsForCurrentUser } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import {
  createExplorePath,
  filterExplorePlaces,
  normalizeExploreFilter,
  updateExploreSearchParams,
} from "../utils/explore";
import { formatTripDateRange } from "../utils/formatters";
import { ActionToast } from "./ActionToast";

export function DuriExploreListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState<string>();
  const query = searchParams.get("q") ?? "";
  const activeFilter = normalizeExploreFilter(searchParams.get("category"));
  const currentUserId = useDuriStore((state) => state.currentUserId);
  const activeTrip = useDuriStore(selectActiveTripForCurrentUser);
  const regionsById = useDuriStore((state) => state.regionsById);
  const placesById = useDuriStore((state) => state.placesById);
  const candidates = useDuriStore((state) => (activeTrip ? state.candidatesByTripId[activeTrip.id] : undefined));
  const itinerary = useDuriStore((state) => (activeTrip ? state.itineraryByTripId[activeTrip.id] : undefined));
  const savedPlaceIds = useDuriStore(selectSavedPlaceIdsForCurrentUser);
  const toggleSavedPlace = useDuriStore((state) => state.toggleSavedPlace);
  const travelPlaces = useMemo(() => Object.values(placesById), [placesById]);
  const scheduledPlaceIds = useMemo(
    () => new Set((itinerary ?? []).flatMap((item) => (item.placeId ? [item.placeId] : []))),
    [itinerary],
  );
  const candidateByPlaceId = useMemo(
    () => new Map((candidates ?? []).map((candidate) => [candidate.placeId, candidate])),
    [candidates],
  );
  const filteredPlaces = useMemo(
    () =>
      filterExplorePlaces({
        places: travelPlaces,
        query,
        filter: activeFilter,
        candidates: candidates ?? [],
        currentUserId,
        scheduledPlaceIds,
      }),
    [activeFilter, candidates, currentUserId, query, scheduledPlaceIds, travelPlaces],
  );
  const regionName = activeTrip ? regionsById[activeTrip.regionId]?.name ?? "지역 미정" : "여행방 선택 전";
  const mapPath = createExplorePath("/explore/map", searchParams);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(undefined), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <div className="px-4 pb-32">
      <header className="sticky top-0 z-10 -mx-4 bg-[#EFF5FF]/95 px-4 pb-3 pt-1 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F]" aria-label="홈으로 돌아가기">
            <ArrowLeft size={22} />
          </Link>
          <label className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_6px_14px_rgba(79,134,247,0.08)]">
            <Search size={18} className="shrink-0 text-[#91BFF5]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setSearchParams(updateExploreSearchParams(searchParams, { query: event.target.value }), { replace: true })}
              placeholder={`${regionName} 후보 장소 검색`}
              aria-label="장소 검색"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-black text-[#243C8F] outline-none placeholder:text-[#B5CDEE]"
            />
          </label>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F]" aria-label="탐색 옵션">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {exploreFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setSearchParams(updateExploreSearchParams(searchParams, { filter }))}
              className={`flex-none rounded-full px-4 py-2 text-[12px] font-black transition ${
                activeFilter === filter ? "bg-[#4388FF] text-white shadow-[0_8px_16px_rgba(67,136,255,0.22)]" : "bg-white text-[#6B8BC8]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-3 overflow-hidden rounded-[26px] bg-[#416CE9] shadow-[0_12px_24px_rgba(67,108,233,0.22)]">
        <div className="relative px-5 py-5">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/14" />
          <div className="absolute -right-4 top-12 h-16 w-16 rounded-full bg-white/12" />
          <p className="text-[13px] font-black text-[#D7E8FF]">{activeTrip?.title ?? "현재 여행방 없음"}</p>
          <h1 className="mt-1 text-[24px] font-black leading-tight text-white">함께 고른 장소를 살펴봐요</h1>
          <div className="mt-4 flex gap-2">
            <Badge
              icon={<CalendarDays size={14} />}
              label={activeTrip ? formatTripDateRange(activeTrip.startDate, activeTrip.endDate) : "여행 날짜 없음"}
            />
            <Badge icon={<Heart size={14} />} label={`후보 ${candidates?.length ?? 0}개`} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-black text-[#7FADED]">Explore</p>
            <h2 className="text-[24px] font-black text-[#243C8F]">추천 장소</h2>
            <p className="mt-1 text-[11px] font-bold text-[#9CB7DD]">검색 결과 {filteredPlaces.length}곳</p>
          </div>
          <div className="flex rounded-2xl bg-white p-1 text-[#91BFF5] shadow-[0_6px_14px_rgba(79,134,247,0.08)]">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-[#EAF3FF] text-[#4388FF]" aria-label="카드 보기">
              <LayoutGrid size={18} />
            </button>
            <Link to={mapPath} className="grid h-9 w-9 place-items-center rounded-xl" aria-label="지도 보기">
              <MapIcon size={18} />
            </Link>
          </div>
        </div>

        {filteredPlaces.length ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredPlaces.map((place) => {
              const candidate = candidateByPlaceId.get(place.id);
              return (
                <ExplorePlaceCard
                  key={place.id}
                  place={place}
                  saved={savedPlaceIds.includes(place.id)}
                  candidateStatus={candidate ? (scheduledPlaceIds.has(place.id) ? "일정 반영" : "후보") : undefined}
                  onToggleSaved={() => {
                    const wasSaved = savedPlaceIds.includes(place.id);
                    toggleSavedPlace(place.id);
                    setToast(wasSaved ? "저장을 해제했어요." : "저장한 장소에 추가했어요.");
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-[24px] bg-white px-5 py-8 text-center shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
            <Search size={24} className="mx-auto text-[#91BFF5]" />
            <h3 className="mt-3 text-[16px] font-black text-[#243C8F]">검색 결과가 없어요</h3>
            <p className="mt-1 text-[12px] font-bold text-[#8CAADA]">검색어나 필터를 바꿔 다시 찾아보세요.</p>
          </div>
        )}
      </section>

      <Link
        to={mapPath}
        className="fixed bottom-[108px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#243C8F] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(36,60,143,0.3)]"
      >
        <MapIcon size={16} />
        지도
      </Link>
      <ActionToast message={toast} />
    </div>
  );
}

function Badge({ icon, label }: { icon: ReactNode; label: string }) {
  return <span className="flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-2 text-[12px] font-black text-white backdrop-blur">{icon}{label}</span>;
}

function ExplorePlaceCard({
  place,
  saved,
  candidateStatus,
  onToggleSaved,
}: {
  place: Place;
  saved: boolean;
  candidateStatus?: string;
  onToggleSaved: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-[22px] bg-white text-left shadow-[0_8px_18px_rgba(79,134,247,0.12)]">
      <Link to={`/places/${place.id}`} state={{ fromDuri: true }} className="block">
        <div
          className="relative h-[108px] bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(20,39,95,0.08), rgba(20,39,95,0.22)), url(${place.imageUrl})` }}
        >
          {candidateStatus ? <span className="absolute bottom-2 left-2 rounded-full bg-[#4388FF] px-2.5 py-1 text-[9px] font-black text-white">{candidateStatus}</span> : null}
        </div>
        <div className="px-3 pb-3 pt-2.5">
          <h3 className="truncate text-[14px] font-black text-[#243C8F]">{place.name}</h3>
          <p className="mt-0.5 truncate text-[11px] font-bold text-[#A0BCE6]">{place.category}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#8CB9EF]"><MapPin size={12} />{place.distanceLabel}</span>
            <span className="flex items-center gap-1 text-[11px] font-black text-[#243C8F]"><Star size={12} className="fill-[#FFD84D] text-[#FFD84D]" />{place.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={onToggleSaved}
        aria-label={saved ? `${place.name} 저장 해제` : `${place.name} 저장하기`}
        aria-pressed={saved}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/92 text-[#4388FF]"
      >
        <Heart size={16} className={saved ? "fill-[#4388FF]" : ""} />
      </button>
    </article>
  );
}
