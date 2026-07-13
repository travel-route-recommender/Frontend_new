import { Clock, Heart, MapPin, Plus, Star, X } from "lucide-react";
import type { ReactNode } from "react";
import type { Place } from "../domain";

type DuriPlaceDetailSheetProps = {
  place: Place | null;
  addedByNames: string[];
  saved: boolean;
  tripActionLabel: string;
  tripActionDisabled: boolean;
  onClose: () => void;
  onToggleSaved: () => void;
  onAddToTrip: () => void;
};

export function DuriPlaceDetailSheet({
  place,
  addedByNames,
  saved,
  tripActionLabel,
  tripActionDisabled,
  onClose,
  onToggleSaved,
  onAddToTrip,
}: DuriPlaceDetailSheetProps) {
  if (!place) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="place-detail-title" className="absolute inset-x-3 bottom-3 z-50 overflow-hidden rounded-[32px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_22px_44px_rgba(36,60,143,0.28)]">
      <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/92 text-[#243C8F]"
        aria-label="닫기"
      >
        <X size={19} />
      </button>

      <div
        className="mt-3 h-[150px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,39,95,0.08), rgba(20,39,95,0.34)), url(${place.imageUrl})`,
        }}
      />

      <div className="px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#4388FF] px-3 py-1.5 text-[11px] font-black text-white">
                {place.category}
              </span>
              {place.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-[#EAF3FF] px-3 py-1.5 text-[11px] font-black text-[#4388FF]">
                  {tag}
                </span>
              ))}
            </div>
            <h2 id="place-detail-title" className="truncate text-[24px] font-black text-[#243C8F]">{place.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-[#88A8D8]">
              <MapPin size={15} />
              {place.address}
            </p>
          </div>
          <span className="flex flex-none items-center gap-1 rounded-full bg-[#FFF8DD] px-3 py-2 text-[13px] font-black text-[#243C8F]">
            <Star size={14} className="fill-[#FFD84D] text-[#FFD84D]" />
            {place.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-4 text-[14px] font-bold leading-6 text-[#6F8AC2]">{place.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoBox icon={<Clock size={17} />} label="거리" value={place.distanceLabel} />
          <InfoBox icon={<Heart size={17} />} label="담은 사람" value={addedByNames.join(", ") || "아직 없음"} />
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1.3fr] gap-3">
          <button
            type="button"
            onClick={onToggleSaved}
            aria-label={saved ? `${place.name} 저장 해제` : `${place.name} 저장하기`}
            className="flex h-[52px] items-center justify-center gap-2 rounded-[18px] bg-[#F1F6FF] px-3 py-4 text-[14px] font-black text-[#4388FF]"
          >
            <Heart size={18} className={saved ? "fill-[#4388FF]" : ""} />
            {saved ? "저장됨" : "저장하기"}
          </button>
          <button
            type="button"
            onClick={onAddToTrip}
            disabled={tripActionDisabled}
            className={`flex h-[52px] min-w-0 items-center justify-center gap-2 rounded-[18px] px-3 py-4 text-[13px] font-black text-white ${
              tripActionDisabled
                ? "cursor-not-allowed bg-[#AFCBF1] shadow-none"
                : "bg-[#4388FF] shadow-[0_12px_22px_rgba(67,136,255,0.28)]"
            }`}
          >
            {tripActionDisabled ? <span className="text-[16px]">✓</span> : <Plus size={18} className="shrink-0" />}
            <span className="truncate">{tripActionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[#F5F9FF] px-3 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[#4388FF]">{icon}</div>
      <p className="text-[11px] font-black text-[#9CB7DD]">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-black text-[#243C8F]">{value}</p>
    </div>
  );
}
