import { ArrowLeft, Crosshair, Heart, List, LocateFixed, MapPin, Minus, Plus, Search, SlidersHorizontal, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { exploreFilters, mapPins } from "../data/travelPages";
import { selectActiveTripForCurrentUser, selectSavedPlaceIdsForCurrentUser } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import {
  createExplorePath,
  filterExplorePlaces,
  normalizeExploreFilter,
  updateExploreSearchParams,
} from "../utils/explore";
import { EmptyState } from "./EmptyState";

export function DuriExploreMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();
  const query = searchParams.get("q") ?? "";
  const activeFilter = normalizeExploreFilter(searchParams.get("category"));
  const currentUserId = useDuriStore((state) => state.currentUserId);
  const activeTrip = useDuriStore(selectActiveTripForCurrentUser);
  const regionsById = useDuriStore((state) => state.regionsById);
  const placesById = useDuriStore((state) => state.placesById);
  const candidates = useDuriStore((state) => (activeTrip ? state.candidatesByTripId[activeTrip.id] : undefined));
  const itinerary = useDuriStore((state) => (activeTrip ? state.itineraryByTripId[activeTrip.id] : undefined));
  const savedPlaceIds = useDuriStore(selectSavedPlaceIdsForCurrentUser);
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
  const filteredPlaceIds = useMemo(() => new Set(filteredPlaces.map((place) => place.id)), [filteredPlaces]);
  const visiblePins = useMemo(() => mapPins.filter((pin) => filteredPlaceIds.has(pin.placeId) && Boolean(placesById[pin.placeId])), [filteredPlaceIds, placesById]);

  useEffect(() => {
    if (!visiblePins.length) {
      setSelectedPlaceId(undefined);
      return;
    }
    if (!selectedPlaceId || !visiblePins.some((pin) => pin.placeId === selectedPlaceId)) {
      setSelectedPlaceId(visiblePins[0].placeId);
    }
  }, [selectedPlaceId, visiblePins]);

  const selectedPlace = selectedPlaceId ? placesById[selectedPlaceId] : undefined;
  const selectedCandidate = selectedPlace ? candidateByPlaceId.get(selectedPlace.id) : undefined;
  const regionName = activeTrip ? regionsById[activeTrip.regionId]?.name ?? "지역 미정" : "여행방 선택 전";
  const listPath = createExplorePath("/explore", searchParams);

  return (
    <div className="relative -mt-1 h-[calc(100dvh-76px)] overflow-hidden bg-[#EAF2FC]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(28deg, transparent 48%, rgba(136,164,203,0.34) 49%, rgba(136,164,203,0.34) 51%, transparent 52%), linear-gradient(115deg, transparent 46%, rgba(158,184,218,0.3) 47%, rgba(158,184,218,0.3) 50%, transparent 51%), radial-gradient(circle at 30% 25%, rgba(67,136,255,0.12), transparent 28%), radial-gradient(circle at 78% 42%, rgba(55,190,170,0.1), transparent 26%)",
          backgroundSize: "180px 180px, 220px 220px, 100% 100%, 100% 100%",
        }}
      />

      <Road className="left-[2%] top-[39%] h-2 w-[64%] rotate-[18deg]" tone="primary" />
      <Road className="left-[31%] top-[22%] h-2 w-[70%] rotate-[117deg]" />
      <Road className="left-[14%] top-[61%] h-2 w-[76%] -rotate-[12deg]" />
      <Road className="left-[48%] top-[14%] h-2 w-[48%] rotate-[76deg]" tone="soft" />
      <Road className="left-[7%] top-[78%] h-2 w-[52%] rotate-[34deg]" tone="soft" />

      <div className="absolute inset-x-4 top-3 z-20">
        <div className="flex items-center gap-3">
          <Link to={listPath} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F] shadow-sm" aria-label="탐색 목록으로 돌아가기">
            <ArrowLeft size={22} />
          </Link>
          <label className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_6px_14px_rgba(79,134,247,0.14)]">
            <Search size={18} className="shrink-0 text-[#91BFF5]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setSearchParams(updateExploreSearchParams(searchParams, { query: event.target.value }), { replace: true })}
              placeholder="지도에서 후보 찾기"
              aria-label="지도 장소 검색"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-black text-[#243C8F] outline-none placeholder:text-[#B5CDEE]"
            />
          </label>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F] shadow-sm" aria-label="지도 탐색 옵션">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {exploreFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setSearchParams(updateExploreSearchParams(searchParams, { filter }))}
              className={`flex-none rounded-full px-4 py-2 text-[12px] font-black shadow-sm ${
                activeFilter === filter ? "bg-[#4388FF] text-white" : "bg-white text-[#6B8BC8]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute left-[39%] top-[42%] h-[155px] w-[120px] rounded-full border-[5px] border-[#6C57FF]/35 border-l-transparent border-t-transparent" />

      {visiblePins.map((pin, index) => {
        const place = placesById[pin.placeId];
        const selected = selectedPlaceId === pin.placeId;
        return (
          <button
            type="button"
            key={pin.placeId}
            onClick={() => setSelectedPlaceId(pin.placeId)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${selected ? "text-[#4388FF]" : "text-[#243C8F]"}`}
            style={{ left: pin.x, top: pin.y }}
            aria-label={`${place.name} 지도 핀 선택`}
          >
            <span className={`grid place-items-center rounded-full bg-white shadow-[0_8px_18px_rgba(36,60,143,0.22)] transition ${selected ? "h-14 w-14 ring-4 ring-[#4388FF]/20" : "h-12 w-12"}`}>
              <MapPin size={selected ? 28 : 25} className={selected || index === 1 ? "fill-[#4388FF]/10" : "fill-[#243C8F]/10"} />
            </span>
          </button>
        );
      })}

      <div className="absolute right-4 top-[42%] z-20 overflow-hidden rounded-2xl bg-white shadow-[0_8px_18px_rgba(36,60,143,0.18)]">
        <button type="button" className="grid h-11 w-11 place-items-center text-[#243C8F]" aria-label="확대"><Plus size={21} /></button>
        <div className="h-px bg-[#E1EBFA]" />
        <button type="button" className="grid h-11 w-11 place-items-center text-[#243C8F]" aria-label="축소"><Minus size={21} /></button>
      </div>

      <button type="button" className="absolute right-4 top-[61%] z-20 grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#243C8F] shadow-[0_8px_18px_rgba(36,60,143,0.18)]" aria-label="현재 위치">
        <LocateFixed size={20} />
      </button>

      <Link to={listPath} className="absolute bottom-[220px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#243C8F] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(36,60,143,0.3)]">
        <List size={16} />목록
      </Link>

      <section className="absolute inset-x-4 bottom-[94px] z-20 rounded-[28px] bg-white p-4 shadow-[0_18px_34px_rgba(36,60,143,0.22)]">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black text-[#7FADED]">지도 탐색</p>
            <h2 className="text-[20px] font-black text-[#243C8F]">{regionName} 후보 장소</h2>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[#EAF3FF] px-3 py-2 text-[12px] font-black text-[#4388FF]">
            <Crosshair size={14} />{visiblePins.length}곳 표시
          </span>
        </div>

        {selectedPlace ? (
          <Link to={`/places/${selectedPlace.id}`} state={{ fromDuri: true }} className="mt-4 flex w-full items-center gap-3 rounded-[20px] bg-[#F5F9FF] p-2 text-left">
            <div className="relative h-16 w-16 flex-none rounded-[18px] bg-cover bg-center" style={{ backgroundImage: `url(${selectedPlace.imageUrl})` }}>
              {savedPlaceIds.includes(selectedPlace.id) ? <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/92 text-[#4388FF]"><Heart size={12} className="fill-[#4388FF]" /></span> : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[15px] font-black text-[#243C8F]">{selectedPlace.name}</h3>
                {selectedCandidate ? <span className="shrink-0 rounded-full bg-[#E7F1FF] px-2 py-0.5 text-[9px] font-black text-[#4388FF]">{scheduledPlaceIds.has(selectedPlace.id) ? "일정 반영" : "후보"}</span> : null}
              </div>
              <p className="mt-0.5 truncate text-[12px] font-bold text-[#8CAADA]">{selectedPlace.tags.join(" · ")}</p>
              <span className="mt-2 flex items-center gap-1 text-[12px] font-black text-[#243C8F]"><Star size={13} className="fill-[#FFD84D] text-[#FFD84D]" />{selectedPlace.rating.toFixed(1)}</span>
            </div>
          </Link>
        ) : (
          <EmptyState
            icon={MapPin}
            compact
            className="mt-4 bg-[#F5F9FF] shadow-none"
            title="지도에 표시할 장소가 없어요"
            description="검색어나 필터를 바꿔 보세요."
            actionLabel="검색 조건 초기화"
            onAction={() => setSearchParams(new URLSearchParams(), { replace: true })}
          />
        )}
      </section>
    </div>
  );
}

function Road({ className, tone = "default" }: { className: string; tone?: "default" | "primary" | "soft" }) {
  const color = tone === "primary" ? "bg-[#A7C6EF]" : tone === "soft" ? "bg-white/75" : "bg-white";
  return <span className={`absolute rounded-full ${color} shadow-sm ${className}`} />;
}
