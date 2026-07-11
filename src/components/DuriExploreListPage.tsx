import { ArrowLeft, CalendarDays, Heart, LayoutGrid, Map, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { exploreFilters, travelPlaces } from "../data/travelPages";
import type { TravelPlace } from "../data/travelPages";

export function DuriExploreListPage() {
  const [activeFilter, setActiveFilter] = useState("전체");
  const navigate = useNavigate();

  const filteredPlaces = useMemo(() => {
    if (activeFilter === "전체") return travelPlaces;
    if (activeFilter === "공통 관심") return travelPlaces.filter((place) => place.addedBy === "모두" || place.addedBy.includes(","));
    if (activeFilter === "내가 담은") return travelPlaces.filter((place) => place.addedBy.includes("수민"));
    if (activeFilter === "두리 추천") return travelPlaces.filter((place) => place.rating >= 4.8);
    return travelPlaces.filter((place) => place.tags.includes(activeFilter) || place.category.includes(activeFilter));
  }, [activeFilter]);

  return (
    <div className="px-4 pb-32">
      <header className="sticky top-0 z-10 -mx-4 bg-[#EFF5FF]/95 px-4 pb-3 pt-1 backdrop-blur">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/")} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F]">
            <ArrowLeft size={22} />
          </button>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_6px_14px_rgba(79,134,247,0.08)]">
            <Search size={18} className="text-[#91BFF5]" />
            <span className="flex-1 truncate text-[14px] font-black text-[#B5CDEE]">부산 후보 장소 검색</span>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F]">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          {exploreFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
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
          <p className="text-[13px] font-black text-[#D7E8FF]">부산 여행방</p>
          <h1 className="mt-1 text-[24px] font-black leading-tight text-white">함께 고른 장소를 살펴봐요</h1>
          <div className="mt-4 flex gap-2">
            <Badge icon={<CalendarDays size={14} />} label="7.18 - 7.19" />
            <Badge icon={<Heart size={14} />} label="후보 8개" />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-black text-[#7FADED]">Explore</p>
            <h2 className="text-[24px] font-black text-[#243C8F]">추천 장소</h2>
          </div>
          <div className="flex rounded-2xl bg-white p-1 text-[#91BFF5] shadow-[0_6px_14px_rgba(79,134,247,0.08)]">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-[#EAF3FF] text-[#4388FF]" aria-label="카드 보기">
              <LayoutGrid size={18} />
            </button>
            <Link to="/explore/map" className="grid h-9 w-9 place-items-center rounded-xl" aria-label="지도 보기">
              <Map size={18} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredPlaces.map((place) => (
            <ExplorePlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      <Link
        to="/explore/map"
        className="fixed bottom-[108px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#243C8F] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(36,60,143,0.3)]"
      >
        <Map size={16} />
        지도
      </Link>
    </div>
  );
}

function Badge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-2 text-[12px] font-black text-white backdrop-blur">
      {icon}
      {label}
    </span>
  );
}

function ExplorePlaceCard({ place }: { place: TravelPlace }) {
  return (
    <Link
      to={`/places/${place.id}`}
      state={{ fromDuri: true }}
      className="overflow-hidden rounded-[22px] bg-white text-left shadow-[0_8px_18px_rgba(79,134,247,0.12)]"
    >
      <div
        className="relative h-[108px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,39,95,0.08), rgba(20,39,95,0.22)), url(${place.imageUrl})`,
        }}
      >
        <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/92 text-[#4388FF]">
          <Heart size={16} className={place.saved ? "fill-[#4388FF]" : ""} />
        </span>
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <h3 className="truncate text-[14px] font-black text-[#243C8F]">{place.name}</h3>
        <p className="mt-0.5 truncate text-[11px] font-bold text-[#A0BCE6]">{place.category}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#8CB9EF]">
            <MapPin size={12} />
            {place.distance}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-black text-[#243C8F]">
            <Star size={12} className="fill-[#FFD84D] text-[#FFD84D]" />
            {place.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
