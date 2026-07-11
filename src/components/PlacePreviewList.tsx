import { Bookmark, MapPin } from "lucide-react";
import type { PlacePreview } from "../data/home";

type PlacePreviewListProps = {
  places: PlacePreview[];
};

const thumbnailTone = {
  mint: "bg-[#DFF3EA] text-duri-green-dark",
  blue: "bg-[#DCECF1] text-duri-blue",
  sand: "bg-duri-sand text-[#80632E]",
  yellow: "bg-[#F8E8B8] text-[#7A5B10]",
};

export function PlacePreviewList({ places }: PlacePreviewListProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">부산 인기 장소</h2>
        <button className="text-sm font-bold text-duri-green-dark">탐색하기</button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {places.map((place) => (
          <article
            key={place.name}
            className="w-[154px] shrink-0 overflow-hidden rounded-[22px] border border-duri-line bg-white shadow-card"
          >
            <div className={`relative h-[96px] ${thumbnailTone[place.tone]}`}>
              <div className="absolute left-3 top-3 rounded-full bg-white/86 px-2.5 py-1 text-[11px] font-extrabold">
                {place.category}
              </div>
              <div className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-2xl bg-white/82">
                <MapPin size={18} strokeWidth={2.3} />
              </div>
              <div className="absolute -bottom-6 right-[-18px] h-20 w-20 rounded-full border-[18px] border-white/38" />
              <div className="absolute bottom-5 right-8 h-12 w-12 rotate-12 rounded-[18px] border-[10px] border-white/35" />
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-h-[38px] text-[15px] font-extrabold leading-tight tracking-normal text-duri-ink">
                  {place.name}
                </h3>
                <button
                  aria-label={`${place.name} 저장`}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                    place.saved ? "bg-duri-green text-white" : "bg-duri-bg text-duri-muted"
                  }`}
                >
                  <Bookmark size={16} fill={place.saved ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="mt-2 line-clamp-2 min-h-[34px] text-[12px] font-semibold leading-[17px] text-duri-muted">
                {place.tag}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
