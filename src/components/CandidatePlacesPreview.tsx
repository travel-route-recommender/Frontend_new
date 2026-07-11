import { Bookmark, Check, MapPin, UserRound } from "lucide-react";
import type { CandidatePlace } from "../data/roomHome";

type CandidatePlacesPreviewProps = {
  places: CandidatePlace[];
};

const toneStyle = {
  mint: "bg-[#DFF3EA] text-duri-green-dark",
  blue: "bg-[#DCECF1] text-duri-blue",
  sand: "bg-duri-sand text-[#745A24]",
  yellow: "bg-[#F8E8B8] text-[#765B12]",
};

export function CandidatePlacesPreview({ places }: CandidatePlacesPreviewProps) {
  return (
    <section>
      <SectionHeader title="후보 장소 미리보기" action="보드 보기" />
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {places.map((place) => (
          <article
            key={place.name}
            className="w-[158px] shrink-0 overflow-hidden rounded-lg border border-duri-line bg-white shadow-card"
          >
            <div className={`relative h-[88px] ${toneStyle[place.tone]}`}>
              <span className="absolute left-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-extrabold">
                {place.category}
              </span>
              <span className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded-lg bg-white/82">
                <MapPin size={17} strokeWidth={2.3} />
              </span>
              <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-lg bg-white/72">
                {place.state === "saved" ? <Check size={17} strokeWidth={2.5} /> : <Bookmark size={16} />}
              </span>
            </div>

            <div className="p-3">
              <h3 className="min-h-[38px] text-[15px] font-extrabold leading-tight tracking-normal text-duri-ink">
                {place.name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {place.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-duri-bg px-2 py-1 text-[11px] font-bold text-duri-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-duri-muted">
                <UserRound size={14} />
                {place.addedBy} 담음
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold tracking-normal text-duri-ink">{title}</h2>
      {action ? <button className="text-sm font-bold text-duri-green-dark">{action}</button> : null}
    </div>
  );
}
