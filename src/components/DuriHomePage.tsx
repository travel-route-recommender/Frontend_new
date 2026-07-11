import {
  ChevronRight,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Place } from "../domain";
import { selectTripStats } from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { formatTripDateRange, formatTripStatus } from "../utils/formatters";

export function DuriHomePage() {
  const currentUser = useDuriStore((state) => state.usersById[state.currentUserId]);
  const activeTripId = useDuriStore((state) => state.activeTripId);
  const activeTrip = useDuriStore((state) => state.tripsById[state.activeTripId]);
  const regionsById = useDuriStore((state) => state.regionsById);
  const placesById = useDuriStore((state) => state.placesById);
  const candidatesByTripId = useDuriStore((state) => state.candidatesByTripId);
  const itineraryByTripId = useDuriStore((state) => state.itineraryByTripId);
  const preferenceResultsByUserId = useDuriStore((state) => state.preferenceResultsByUserId);
  const regions = useMemo(() => Object.values(regionsById), [regionsById]);
  const travelPlaces = useMemo(() => Object.values(placesById), [placesById]);
  const featuredRegion = regions[0];
  const tripStats = useMemo(
    () =>
      selectTripStats(
        {
          ...useDuriStore.getState(),
          candidatesByTripId,
          itineraryByTripId,
          preferenceResultsByUserId,
        },
        activeTripId,
      ),
    [activeTripId, candidatesByTripId, itineraryByTripId, preferenceResultsByUserId],
  );

  return (
    <div className="px-5 pb-32">
      <header className="pt-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[17px] font-black text-[#8BC6FF]">
              <span>좋은 하루예요{currentUser ? `, ${currentUser.name}님` : ""}</span>
              <Sun size={18} className="fill-[#FFD56A] text-[#FFD56A]" />
            </div>
            <h1 className="mt-1 whitespace-nowrap text-[29px] font-black leading-[1.15] text-[#243C8F]">어디로 떠나볼까요?</h1>
          </div>
          <Link
            to="/mypage"
            className="grid h-[58px] w-[58px] place-items-center rounded-[22px] bg-[#4388FF] text-white shadow-[0_14px_24px_rgba(67,136,255,0.34)]"
            aria-label="프로필"
          >
            <Users size={27} strokeWidth={2.4} />
          </Link>
        </div>

        <Link
          to="/explore"
          className="mt-6 flex h-[70px] w-full items-center gap-3 rounded-[24px] bg-white px-5 text-left shadow-[0_8px_18px_rgba(79,134,247,0.12)]"
        >
          <Search size={31} className="text-[#9BC8FA]" strokeWidth={2.1} />
          <span className="min-w-0 flex-1 truncate whitespace-nowrap text-[18px] font-black text-[#C8DDF7]">지역·관광지·명소 검색</span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#4388FF] text-white">
            <SlidersHorizontal size={22} />
          </span>
        </Link>
      </header>

      {activeTrip ? (
        <section className="mt-4 rounded-[24px] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
          <Link to="/trips" className="flex w-full items-center gap-3 text-left">
            <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#E9F3FF] text-[#4388FF]">
              <Sparkles size={23} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-[#8AB6EE]">함께 준비 중</p>
              <h2 className="truncate text-[16px] font-black text-[#243C8F]">{activeTrip.title}</h2>
              <p className="mt-0.5 truncate text-[12px] font-bold text-[#82A4DC]">
                {formatTripDateRange(activeTrip.startDate, activeTrip.endDate)} · 후보 {tripStats.candidateCount}개 · {formatTripStatus(activeTrip.status)}
              </p>
            </div>
            <ChevronRight size={20} className="text-[#8AB6EE]" />
          </Link>
        </section>
      ) : null}

      <section className="mt-7">
        <SectionTitle title="지역으로 탐색" action="전체 보기" to="/explore" />
        <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar">
          {regions.map((region) => (
            <Link
              key={region.id}
              to="/explore"
              className="w-[90px] flex-none overflow-hidden rounded-[22px] bg-white text-center shadow-[0_8px_18px_rgba(79,134,247,0.12)]"
            >
              <div
                className="h-[64px] bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(36,60,143,0.1), rgba(36,60,143,0.22)), url(${region.imageUrl})`,
                }}
              />
              <div className="px-2 py-3 text-[16px] font-black text-[#243C8F]">{region.shortName}</div>
            </Link>
          ))}
        </div>
      </section>

      {featuredRegion ? (
        <section className="mt-6">
          <Link
            to="/explore"
            className="relative block h-[158px] w-full overflow-hidden rounded-[30px] bg-[#132B6D] text-left shadow-[0_14px_26px_rgba(36,60,143,0.22)]"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(15,32,85,0.92), rgba(18,43,109,0.52), rgba(18,43,109,0.2)), url(${featuredRegion.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 px-5 py-5">
              <div className="flex items-center gap-1.5 text-[14px] font-black text-[#CFE3FF]">
                <span>이번 주 추천</span>
                <Sparkles size={16} className="text-[#FFD86F]" />
              </div>
              <div className="mt-7">
                <h2 className="text-[30px] font-black text-white">{featuredRegion.name}</h2>
                <div className="mt-4 flex gap-2">
                  <InfoPill label={`관광지 ${featuredRegion.spots}곳`} />
                  <InfoPill label={featuredRegion.weather} />
                </div>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mt-7">
        <SectionTitle title="추천 여행지" action="더 보기" to="/explore" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          {travelPlaces.slice(0, 4).map((place) => (
            <PlaceCard key={place.id} place={place} regionName={regionsById[place.regionId]?.name ?? ""} />
          ))}
        </div>
      </section>

      <section className="mt-7 grid grid-cols-[1fr_auto] items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
        <div>
          <p className="text-[13px] font-black text-[#4C8DFF]">지도에서 바로 보기</p>
          <p className="mt-1 text-[13px] font-bold leading-5 text-[#7898CE]">후보 장소와 현재 동선을 한 화면에서 확인해요.</p>
        </div>
        <Link to="/explore/map" className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#E9F3FF] text-[#4388FF]" aria-label="지도 보기">
          <Filter size={22} />
        </Link>
      </section>
    </div>
  );
}

function SectionTitle({ title, action, to }: { title: string; action: string; to: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[22px] font-black text-[#243C8F]">{title}</h2>
      <Link to={to} className="flex items-center gap-0.5 text-[16px] font-black text-[#6AA9FF]">
        {action}
        <ChevronRight size={19} />
      </Link>
    </div>
  );
}

function InfoPill({ label }: { label: string }) {
  return <span className="rounded-full bg-white/18 px-4 py-2 text-[13px] font-black text-white backdrop-blur">{label}</span>;
}

function PlaceCard({ place, regionName }: { place: Place; regionName: string }) {
  return (
    <Link
      to={`/places/${place.id}`}
      state={{ fromDuri: true }}
      className="overflow-hidden rounded-[26px] bg-white text-left shadow-[0_8px_18px_rgba(79,134,247,0.12)]"
    >
      <div
        className="relative h-[126px] bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(15,32,85,0.08), rgba(15,32,85,0.18)), url(${place.imageUrl})` }}
      >
        <span className="absolute left-3 top-3 rounded-full bg-[#4388FF] px-3 py-1.5 text-[12px] font-black text-white">{place.tags[0]}</span>
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1.5 text-[12px] font-black text-[#243C8F]">
          <Star size={13} className="fill-[#FFD84D] text-[#FFD84D]" />
          {place.rating.toFixed(1)}
        </span>
      </div>
      <div className="px-4 py-4">
        <h3 className="truncate text-[17px] font-black text-[#243C8F]">{place.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-[13px] font-bold text-[#8CB9EF]">
          <MapPin size={14} />
          <span>{regionName}</span>
        </div>
      </div>
    </Link>
  );
}
