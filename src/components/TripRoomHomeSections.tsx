import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CalendarRange,
  Check,
  Clock3,
  HeartHandshake,
  MapPin,
  MapPinned,
  Share2,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { TripRoom, User } from "../domain";
import { formatTripDateRange, formatTripStatus } from "../utils/formatters";

export type CandidatePreviewView = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  imageUrl: string;
  addedByNames: string[];
  recommendedByDuri: boolean;
  scheduledDay?: string;
};

export type SchedulePreviewView = {
  id: string;
  dayLabel: string;
  startTime: string;
  name: string;
  category: string;
};

const avatarTones = [
  "bg-[#4388FF] text-white",
  "bg-[#DCEBFF] text-[#376DCE]",
  "bg-[#FFF0CE] text-[#8A6614]",
  "bg-[#E8E4FF] text-[#6753B7]",
];

export function RoomHomeHeader({
  trip,
  regionName,
  members,
  shareMessage,
  onShare,
}: {
  trip: TripRoom;
  regionName: string;
  members: User[];
  shareMessage?: string;
  onShare: () => void;
}) {
  return (
    <header>
      <div className="flex items-center justify-between">
        <Link to="/trips" className="grid h-10 w-10 place-items-center rounded-[15px] bg-white text-[#4388FF]" aria-label="내 여행방으로 돌아가기">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-[13px] font-black text-[#7FADED]">여행방 홈</p>
        <button type="button" onClick={onShare} className="grid h-10 w-10 place-items-center rounded-[15px] bg-white text-[#4388FF]" aria-label="여행방 공유하기">
          <Share2 size={18} />
        </button>
      </div>

      <section className="relative mt-4 overflow-hidden rounded-[30px] bg-[#4388FF] px-5 py-6 text-white shadow-[0_14px_28px_rgba(67,136,255,0.28)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-white/8" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[12px] font-black text-[#D9E9FF]"><MapPin size={13} />{regionName}</p>
              <h1 className="mt-2 text-[26px] font-black leading-tight">{trip.title || "이름 없는 여행방"}</h1>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white/18"><MapPinned size={23} /></span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <HeaderPill icon={CalendarDays} label={formatTripDateRange(trip.startDate, trip.endDate)} />
            <HeaderPill icon={UsersRound} label={`${trip.members.length}명`} />
            <span className="rounded-full bg-white/18 px-3 py-2 text-[11px] font-black">{formatTripStatus(trip.status)}</span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/18 pt-4">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member, index) => (
                <span key={member.id} title={member.name} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-[#4388FF] text-[12px] font-black ${avatarTones[index % avatarTones.length]}`}>
                  {member.initial}
                </span>
              ))}
            </div>
            <p className="text-[11px] font-bold text-[#D9E9FF]">함께 계획을 완성해 보세요</p>
          </div>
        </div>
      </section>

      {shareMessage ? <p className="mt-3 rounded-[16px] bg-white px-4 py-3 text-center text-[12px] font-bold text-[#4388FF] shadow-[0_6px_14px_rgba(79,134,247,0.08)]">{shareMessage}</p> : null}
    </header>
  );
}

export function RoomStatsGrid({
  stats,
}: {
  stats: {
    companionCount: number;
    completedPreferenceCount: number;
    preferenceTargetCount: number;
    candidateCount: number;
    scheduledCount: number;
    unplannedCount: number;
  };
}) {
  const metrics = [
    { label: "참여자", value: `${stats.companionCount}명` },
    { label: "성향 응답", value: `${stats.completedPreferenceCount}/${stats.preferenceTargetCount}` },
    { label: "후보 장소", value: `${stats.candidateCount}개` },
    { label: "일정 반영", value: `${stats.scheduledCount}개` },
    { label: "미배치 후보", value: `${stats.unplannedCount}개` },
  ];

  return (
    <section>
      <SectionTitle title="핵심 통계" />
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <article key={metric.label} className={`rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(79,134,247,0.09)] ${index === metrics.length - 1 ? "col-span-2" : ""}`}>
            <p className="text-[11px] font-black text-[#9CB7DD]">{metric.label}</p>
            <p className="mt-1 text-[22px] font-black text-[#243C8F]">{metric.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RoomQuickActions({ tripId, onExplore }: { tripId: string; onExplore: () => void }) {
  return (
    <section>
      <SectionTitle title="빠른 실행" />
      <div className="grid grid-cols-2 gap-3">
        <QuickAction to="/explore" icon={MapPinned} label="장소 탐색" description="후보를 찾아봐요" onClick={onExplore} primary />
        <QuickAction to={`/trips/${tripId}/workspace`} icon={CalendarRange} label="워크스페이스" description="일정을 구성해요" />
        <QuickAction to="/trips" icon={Building2} label="내 여행방" description="목록으로 돌아가요" />
        <button type="button" disabled className="rounded-[22px] bg-white px-4 py-4 text-left opacity-65 shadow-[0_8px_18px_rgba(79,134,247,0.08)]">
          <span className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#F1F6FF] text-[#8CAADA]"><HeartHandshake size={19} /></span>
          <span className="mt-3 block text-[14px] font-black text-[#243C8F]">동행자 궁합</span>
          <span className="mt-1 block text-[11px] font-bold text-[#9CB7DD]">준비 중이에요</span>
        </button>
      </div>
    </section>
  );
}

export function CandidatePlacesPreview({ candidates, onExplore }: { candidates: CandidatePreviewView[]; onExplore: () => void }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle title="후보 장소 미리보기" compact />
        {candidates.length ? <Link to="/explore" onClick={onExplore} className="text-[12px] font-black text-[#4388FF]">장소 더 찾기</Link> : null}
      </div>
      {candidates.length ? (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <Link key={candidate.id} to={`/places/${candidate.id}`} className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-[0_8px_18px_rgba(79,134,247,0.09)]">
              <div className="h-[72px] w-[72px] shrink-0 rounded-[18px] bg-cover bg-center" style={{ backgroundImage: `url(${candidate.imageUrl})` }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[14px] font-black text-[#243C8F]">{candidate.name}</h3>
                  {candidate.recommendedByDuri ? <span className="shrink-0 rounded-full bg-[#E7F1FF] px-2 py-0.5 text-[9px] font-black text-[#4388FF]">두리</span> : null}
                </div>
                <p className="mt-1 truncate text-[11px] font-bold text-[#8CAADA]">{candidate.category} · {candidate.tags.slice(0, 2).join(" · ")}</p>
                <p className="mt-2 truncate text-[10px] font-bold text-[#9CB7DD]">{candidate.addedByNames.join(", ") || "참여자"} 담음 · {candidate.scheduledDay ? `${candidate.scheduledDay} 배치됨` : "미배치"}</p>
              </div>
              {candidate.scheduledDay ? <Check size={17} className="shrink-0 text-[#4388FF]" /> : <ArrowRight size={16} className="shrink-0 text-[#A7C0E3]" />}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyPreview icon={MapPinned} title="아직 후보 장소가 없어요" description="함께 가고 싶은 장소를 탐색해 보세요." cta="장소 탐색하기" to="/explore" onClick={onExplore} />
      )}
    </section>
  );
}

export function DraftSchedulePreview({ items, tripId }: { items: SchedulePreviewView[]; tripId: string }) {
  const workspaceTo = `/trips/${tripId}/workspace`;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle title="현재 일정 미리보기" compact />
        {items.length ? <Link to={workspaceTo} className="text-[12px] font-black text-[#4388FF]">전체 일정 보기</Link> : null}
      </div>
      {items.length ? (
        <div className="rounded-[26px] bg-white p-4 shadow-[0_8px_18px_rgba(79,134,247,0.09)]">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#4388FF] text-[11px] font-black text-white">{index + 1}</span>
                <div className="min-w-0 flex-1 border-b border-[#E7EFFB] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#8CAADA]"><span>{item.dayLabel}</span><span>·</span><Clock3 size={11} /><span>{item.startTime}</span></div>
                  <p className="mt-1 truncate text-[14px] font-black text-[#243C8F]">{item.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#9CB7DD]">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyPreview icon={CalendarRange} title="아직 일정이 없어요" description="워크스페이스에서 후보 장소를 일정으로 구성해 보세요." cta="워크스페이스에서 일정 만들기" to={workspaceTo} />
      )}
    </section>
  );
}

export function AnalysisEmptyState({ tripId }: { tripId: string }) {
  return (
    <section>
      <SectionTitle title="두리 분석 요약" />
      <EmptyPreview icon={BarChart3} title="분석을 준비하고 있어요" description="성향 응답과 후보 장소가 모이면 두리 분석을 확인할 수 있어요." cta="워크스페이스 열기" to={`/trips/${tripId}/workspace`} />
    </section>
  );
}

export function NextActionCard({ title, description, cta, to, onClick }: { title: string; description: string; cta: string; to: string; onClick?: () => void }) {
  return (
    <section className="rounded-[28px] bg-[#243C8F] px-5 py-5 text-white shadow-[0_14px_26px_rgba(36,60,143,0.22)]">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-white/14"><Sparkles size={20} /></span>
        <div>
          <p className="text-[11px] font-black text-[#AFCFFF]">다음 행동</p>
          <h2 className="mt-1 text-[18px] font-black">{title}</h2>
          <p className="mt-1 text-[12px] font-bold leading-5 text-[#CFDFFF]">{description}</p>
        </div>
      </div>
      <Link to={to} onClick={onClick} className="mt-4 flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white text-[13px] font-black text-[#243C8F]">
        {cta}<ArrowRight size={16} />
      </Link>
    </section>
  );
}

export function TripRoomNotFound() {
  return (
    <div className="px-5 pb-32 pt-8">
      <section className="rounded-[28px] bg-white px-5 py-8 text-center shadow-[0_12px_26px_rgba(79,134,247,0.12)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-[#EAF3FF] text-[#4388FF]"><Building2 size={27} /></span>
        <p className="mt-5 text-[12px] font-black text-[#7FADED]">여행방 없음</p>
        <h1 className="mt-1 text-[23px] font-black text-[#243C8F]">여행방을 찾을 수 없어요</h1>
        <p className="mt-2 text-[13px] font-bold leading-5 text-[#7898CE]">내 여행방 목록에서 다시 선택해 주세요.</p>
        <Link to="/trips" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#4388FF] text-[14px] font-black text-white"><ArrowLeft size={17} />내 여행방으로 돌아가기</Link>
      </section>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, description, primary, onClick }: { to: string; icon: typeof MapPinned; label: string; description: string; primary?: boolean; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className={`rounded-[22px] px-4 py-4 shadow-[0_8px_18px_rgba(79,134,247,0.08)] ${primary ? "bg-[#4388FF] text-white" : "bg-white text-[#243C8F]"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-[15px] ${primary ? "bg-white/18" : "bg-[#EAF3FF] text-[#4388FF]"}`}><Icon size={19} /></span>
      <span className="mt-3 block text-[14px] font-black">{label}</span>
      <span className={`mt-1 block text-[11px] font-bold ${primary ? "text-[#D9E9FF]" : "text-[#9CB7DD]"}`}>{description}</span>
    </Link>
  );
}

function EmptyPreview({ icon: Icon, title, description, cta, to, onClick }: { icon: typeof MapPinned; title: string; description: string; cta: string; to: string; onClick?: () => void }) {
  return (
    <div className="rounded-[26px] bg-white px-5 py-6 text-center shadow-[0_8px_18px_rgba(79,134,247,0.09)]">
      <span className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-[18px] bg-[#EAF3FF] text-[#4388FF]"><Icon size={22} /></span>
      <h3 className="mt-3 text-[15px] font-black text-[#243C8F]">{title}</h3>
      <p className="mt-1 text-[12px] font-bold leading-5 text-[#8CAADA]">{description}</p>
      <Link to={to} onClick={onClick} className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-[17px] bg-[#F1F6FF] px-5 text-[12px] font-black text-[#4388FF]">{cta}<ArrowRight size={15} /></Link>
    </div>
  );
}

function SectionTitle({ title, compact }: { title: string; compact?: boolean }) {
  return <h2 className={`${compact ? "" : "mb-3"} text-[20px] font-black text-[#243C8F]`}>{title}</h2>;
}

function HeaderPill({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-2 text-[11px] font-black"><Icon size={13} />{label}</span>;
}
