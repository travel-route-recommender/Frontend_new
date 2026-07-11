import { ArrowLeft, Crosshair, List, LocateFixed, MapPin, Minus, Plus, Search, SlidersHorizontal, Star } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mapPins } from "../data/travelPages";
import { useDuriStore } from "../store/useDuriStore";

export function DuriExploreMapPage() {
  const navigate = useNavigate();
  const placesById = useDuriStore((state) => state.placesById);
  const travelPlaces = useMemo(() => Object.values(placesById), [placesById]);

  return (
    <div className="relative -mt-1 h-[calc(100vh-76px)] min-h-[704px] overflow-hidden bg-[#EAF2FC]">
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
          <button type="button" onClick={() => navigate("/explore")} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F] shadow-sm">
            <ArrowLeft size={22} />
          </button>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_6px_14px_rgba(79,134,247,0.14)]">
            <Search size={18} className="text-[#91BFF5]" />
            <span className="flex-1 truncate text-[14px] font-black text-[#B5CDEE]">지도에서 후보 찾기</span>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#243C8F] shadow-sm">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {["전체", "공통 관심", "미배치", "야경", "카페"].map((chip, index) => (
            <button
              type="button"
              key={chip}
              className={`flex-none rounded-full px-4 py-2 text-[12px] font-black shadow-sm ${
                index === 0 ? "bg-[#4388FF] text-white" : "bg-white text-[#6B8BC8]"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute left-[39%] top-[42%] h-[155px] w-[120px] rounded-full border-[5px] border-[#6C57FF]/35 border-l-transparent border-t-transparent" />

      {mapPins.map((pin, index) => {
        const place = placesById[pin.placeId];
        if (!place) return null;

        return (
          <Link
            key={pin.placeId}
            to={`/places/${place.id}`}
            state={{ fromDuri: true }}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${
              index === 1 ? "text-[#4388FF]" : "text-[#243C8F]"
            }`}
            style={{ left: pin.x, top: pin.y }}
            aria-label={place.name}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_18px_rgba(36,60,143,0.22)]">
              <MapPin size={25} className={index === 1 ? "fill-[#4388FF]/10" : "fill-[#243C8F]/10"} />
            </span>
          </Link>
        );
      })}

      <div className="absolute right-4 top-[42%] z-20 overflow-hidden rounded-2xl bg-white shadow-[0_8px_18px_rgba(36,60,143,0.18)]">
        <button type="button" className="grid h-11 w-11 place-items-center text-[#243C8F]" aria-label="확대">
          <Plus size={21} />
        </button>
        <div className="h-px bg-[#E1EBFA]" />
        <button type="button" className="grid h-11 w-11 place-items-center text-[#243C8F]" aria-label="축소">
          <Minus size={21} />
        </button>
      </div>

      <button
        type="button"
        className="absolute right-4 top-[61%] z-20 grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#243C8F] shadow-[0_8px_18px_rgba(36,60,143,0.18)]"
        aria-label="현재 위치"
      >
        <LocateFixed size={20} />
      </button>

      <Link
        to="/explore"
        className="absolute bottom-[220px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#243C8F] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(36,60,143,0.3)]"
      >
        <List size={16} />
        목록
      </Link>

      <section className="absolute inset-x-4 bottom-[94px] z-20 rounded-[28px] bg-white p-4 shadow-[0_18px_34px_rgba(36,60,143,0.22)]">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black text-[#7FADED]">지도 탐색</p>
            <h2 className="text-[20px] font-black text-[#243C8F]">부산 후보 장소</h2>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[#EAF3FF] px-3 py-2 text-[12px] font-black text-[#4388FF]">
            <Crosshair size={14} />
            5곳 표시
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {travelPlaces.slice(0, 2).map((place) => (
            <Link
              key={place.id}
              to={`/places/${place.id}`}
              state={{ fromDuri: true }}
              className="flex w-full items-center gap-3 rounded-[20px] bg-[#F5F9FF] p-2 text-left"
            >
              <div
                className="h-16 w-16 flex-none rounded-[18px] bg-cover bg-center"
                style={{ backgroundImage: `url(${place.imageUrl})` }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-black text-[#243C8F]">{place.name}</h3>
                <p className="mt-0.5 truncate text-[12px] font-bold text-[#8CAADA]">{place.tags.join(" · ")}</p>
                <span className="mt-2 flex items-center gap-1 text-[12px] font-black text-[#243C8F]">
                  <Star size={13} className="fill-[#FFD84D] text-[#FFD84D]" />
                  {place.rating.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Road({ className, tone = "default" }: { className: string; tone?: "default" | "primary" | "soft" }) {
  const color = tone === "primary" ? "bg-[#A7C6EF]" : tone === "soft" ? "bg-white/75" : "bg-white";

  return <span className={`absolute rounded-full ${color} shadow-sm ${className}`} />;
}
