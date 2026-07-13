import { Check, Heart, MapPin, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Place } from "../domain";

type PlaceCardProps = {
  place: Place;
  saved: boolean;
  candidateStatus?: string;
  variant?: "compact" | "saved";
  tripActionLabel?: string;
  tripActionDisabled?: boolean;
  onToggleSaved: () => void;
  onAddToTrip?: () => void;
};

export function PlaceCard({
  place,
  saved,
  candidateStatus,
  variant = "compact",
  tripActionLabel,
  tripActionDisabled = false,
  onToggleSaved,
  onAddToTrip,
}: PlaceCardProps) {
  const detailed = variant === "saved";
  const imageUrl = place.imageUrl?.trim();

  return (
    <article className="relative min-w-0 overflow-hidden rounded-[22px] bg-white text-left shadow-[0_8px_18px_rgba(79,134,247,0.12)]">
      <Link to={`/places/${place.id}`} state={{ fromDuri: true }} className="block min-w-0">
        <div
          className={`relative bg-[#DCEAFF] bg-cover bg-center ${detailed ? "h-[142px]" : "h-[108px]"}`}
          style={imageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(20,39,95,0.08), rgba(20,39,95,0.28)), url(${imageUrl})` } : undefined}
        >
          {!imageUrl ? <MapPin size={28} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#91BFF5]" /> : null}
          {candidateStatus ? (
            <span className="absolute bottom-2 left-2 rounded-full bg-[#4388FF] px-2.5 py-1 text-[9px] font-black text-white">
              {candidateStatus}
            </span>
          ) : null}
        </div>
        <div className={detailed ? "px-4 pb-3 pt-3" : "px-3 pb-3 pt-2.5"}>
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className={`${detailed ? "text-[16px]" : "text-[14px]"} truncate font-black text-[#243C8F]`}>{place.name}</h3>
              <p className="mt-0.5 truncate text-[11px] font-bold text-[#A0BCE6]">
                {detailed ? place.address || "주소 정보 없음" : place.category}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-black text-[#243C8F]">
              <Star size={12} className="fill-[#FFD84D] text-[#FFD84D]" />
              {Number.isFinite(place.rating) ? place.rating.toFixed(1) : "-"}
            </span>
          </div>

          {detailed ? (
            <>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded-full bg-[#EAF3FF] px-2.5 py-1 text-[10px] font-black text-[#4388FF]">{place.category || "기타"}</span>
                <div className="flex min-w-0 gap-1 overflow-hidden">
                  {(Array.isArray(place.tags) ? place.tags : []).slice(0, 2).map((tag) => (
                    <span key={tag} className="shrink-0 rounded-full bg-[#F5F9FF] px-2 py-1 text-[9px] font-black text-[#88A8D8]">#{tag}</span>
                  ))}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-5 text-[#7898CE]">{place.summary}</p>
            </>
          ) : (
            <div className="mt-2 flex items-center justify-between">
              <span className="flex min-w-0 items-center gap-1 truncate text-[11px] font-bold text-[#8CB9EF]"><MapPin size={12} className="shrink-0" />{place.distanceLabel}</span>
            </div>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={onToggleSaved}
        aria-label={saved ? `${place.name} 저장 해제` : `${place.name} 저장하기`}
        aria-pressed={saved}
        className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/92 text-[#4388FF] shadow-sm"
      >
        <Heart size={18} className={saved ? "fill-[#4388FF]" : ""} />
      </button>

      {detailed && onAddToTrip && tripActionLabel ? (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onAddToTrip}
            disabled={tripActionDisabled}
            className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] px-3 text-[12px] font-black ${
              tripActionDisabled ? "cursor-not-allowed bg-[#E8F1FE] text-[#4388FF]" : "bg-[#4388FF] text-white"
            }`}
          >
            {tripActionDisabled ? <Check size={16} /> : <Plus size={16} />}
            <span className="truncate">{tripActionLabel}</span>
          </button>
        </div>
      ) : null}
    </article>
  );
}
