import {
  Bookmark,
  Building2,
  ChevronRight,
  CircleHelp,
  Compass,
  Home,
  Info,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import type { User } from "../domain";
import {
  selectCurrentUser,
  selectCurrentUserNextTrip,
  selectCurrentUserPreferenceResult,
  selectCurrentUserTripSummary,
  selectSavedPlaceCountForCurrentUser,
  selectSavedPlacesForCurrentUser,
  selectTripStats,
} from "../store/selectors";
import { useDuriStore } from "../store/useDuriStore";
import { formatTripDateRange, formatTripStatus } from "../utils/formatters";
import { TravelRoomCard } from "./TravelRoomCard";

export function MyPageDashboard() {
  const currentUser = useDuriStore(selectCurrentUser);
  const preference = useDuriStore(selectCurrentUserPreferenceResult);
  const tripSummary = useDuriStore(useShallow(selectCurrentUserTripSummary));
  const nextTrip = useDuriStore(selectCurrentUserNextTrip);
  const savedPlaces = useDuriStore(useShallow(selectSavedPlacesForCurrentUser));
  const savedCount = useDuriStore(selectSavedPlaceCountForCurrentUser);
  const nextTripStats = useDuriStore(useShallow((state) =>
    nextTrip ? selectTripStats(state, nextTrip.id) : undefined));
  const nextTripMembers = useDuriStore(useShallow((state) =>
    nextTrip
      ? nextTrip.members.flatMap((member) => state.usersById[member.userId] ? [state.usersById[member.userId]] : [])
      : []));
  const nextTripRegionName = useDuriStore((state) =>
    nextTrip ? state.regionsById[nextTrip.regionId]?.name ?? "지역 미정" : "지역 미정");

  if (!currentUser) return <MissingUserState />;

  const preferenceTo = preference ? "/tests/personal/result" : "/tests/personal";

  return (
    <div className="min-w-0 overflow-x-hidden px-4 pb-36 pt-2">
      <ProfileHeader user={currentUser} preferenceCompleted={Boolean(preference)} />

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_10px_24px_rgba(79,134,247,0.11)]">
        <SectionHeading eyebrow="My travel style" title="개인 여행 성향" />
        {preference ? (
          <>
            <div className="mt-4 rounded-[22px] bg-[#F2F7FF] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#7FADED]">테스트 완료</p>
                  <h3 className="mt-1 truncate text-[20px] font-black text-[#243C8F]">{preference.profileType}</h3>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#4388FF] text-white">
                  <Sparkles size={21} />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {preference.traits.slice(0, 4).map((trait) => (
                  <span key={trait} className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#4388FF]">#{trait}</span>
                ))}
              </div>
            </div>
            <TextLink to="/tests/personal/result" label="결과 자세히 보기" />
          </>
        ) : (
          <div className="mt-4 rounded-[22px] bg-[#F5F9FF] px-4 py-5 text-center">
            <Sparkles size={24} className="mx-auto text-[#91BFF5]" />
            <h3 className="mt-3 text-[15px] font-black text-[#243C8F]">아직 여행 성향을 확인하지 않았어요.</h3>
            <p className="mt-1 text-[12px] font-bold leading-5 text-[#8CAADA]">간단한 테스트로 나에게 맞는 여행 방식을 알아보세요.</p>
            <Link to="/tests/personal" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[16px] bg-[#4388FF] px-5 text-[13px] font-black text-white">성향 테스트 시작</Link>
          </div>
        )}
      </section>

      <section className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <SectionHeading eyebrow="My trips" title="내 여행 요약" />
          <Link to="/trips" className="shrink-0 text-[12px] font-black text-[#4388FF]">내 여행방 보기</Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <DashboardStat label="준비 중인 여행" value={tripSummary.planningCount} />
          <DashboardStat label="지난 여행" value={tripSummary.completedCount} />
          <DashboardStat label="전체 여행" value={tripSummary.totalCount} />
        </div>

        {nextTrip && nextTripStats ? (
          <div className="mt-4">
            <p className="mb-3 text-[12px] font-black text-[#7FADED]">가장 가까운 여행</p>
            <TravelRoomCard
              tripId={nextTrip.id}
              title={nextTrip.title || "이름 없는 여행방"}
              regionName={nextTripRegionName}
              dateLabel={formatTripDateRange(nextTrip.startDate, nextTrip.endDate)}
              statusLabel={formatTripStatus(nextTrip.status)}
              members={nextTripMembers}
              memberCount={nextTrip.members.length}
              candidateCount={nextTripStats.candidateCount}
              scheduledCount={nextTripStats.scheduledCount}
              completedPreferenceCount={nextTripStats.completedPreferenceCount}
              preferenceTargetCount={nextTripStats.preferenceTargetCount}
            />
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] bg-white px-5 py-6 text-center shadow-[0_8px_18px_rgba(79,134,247,0.08)]">
            <Building2 size={25} className="mx-auto text-[#91BFF5]" />
            <h3 className="mt-3 text-[15px] font-black text-[#243C8F]">아직 참여 중인 여행이 없어요.</h3>
            <Link to="/trips/new" className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[16px] bg-[#4388FF] px-5 text-[13px] font-black text-white"><Plus size={16} />새 여행방 만들기</Link>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[28px] bg-white p-5 shadow-[0_10px_24px_rgba(79,134,247,0.1)]">
        <div className="flex items-end justify-between gap-3">
          <SectionHeading eyebrow="Saved places" title="저장한 장소" />
          <span className="shrink-0 rounded-full bg-[#EAF3FF] px-3 py-1.5 text-[11px] font-black text-[#4388FF]">{savedCount}곳</span>
        </div>
        {savedPlaces.length ? (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {savedPlaces.slice(0, 3).map((place) => {
                const imageUrl = place.imageUrl?.trim();
                return (
                  <Link key={place.id} to={`/places/${place.id}`} state={{ fromDuri: true }} className="min-w-0">
                    <div
                      className="relative aspect-square overflow-hidden rounded-[17px] bg-[#E4EFFF] bg-cover bg-center"
                      style={imageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(36,60,143,0.04), rgba(36,60,143,0.2)), url(${imageUrl})` } : undefined}
                    >
                      {!imageUrl ? <MapPin size={21} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#91BFF5]" /> : null}
                    </div>
                    <p className="mt-2 truncate text-center text-[11px] font-black text-[#243C8F]">{place.name}</p>
                  </Link>
                );
              })}
            </div>
            <TextLink to="/saved" label="저장한 장소 보기" />
          </>
        ) : (
          <div className="mt-4 rounded-[22px] bg-[#F5F9FF] px-4 py-5 text-center">
            <Bookmark size={24} className="mx-auto text-[#91BFF5]" />
            <h3 className="mt-3 text-[15px] font-black text-[#243C8F]">아직 저장한 장소가 없어요.</h3>
            <Link to="/explore" className="mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[16px] bg-[#4388FF] px-5 text-[13px] font-black text-white"><Compass size={16} />장소 둘러보기</Link>
          </div>
        )}
      </section>

      <section className="mt-6">
        <SectionHeading eyebrow="Quick links" title="바로가기" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <QuickLink to="/trips" icon={Building2} label="내 여행방" />
          <QuickLink to="/saved" icon={Bookmark} label="저장한 장소" />
          <QuickLink to={preferenceTo} icon={Sparkles} label={preference ? "성향 결과" : "성향 테스트"} />
          <QuickLink to="/explore" icon={Compass} label="장소 탐색" />
        </div>
      </section>

      <section className="mt-6 rounded-[28px] bg-white p-5 shadow-[0_8px_18px_rgba(79,134,247,0.08)]">
        <SectionHeading eyebrow="Information" title="설정 및 안내" />
        <div className="mt-4 divide-y divide-[#E5EEFA]">
          <InfoRow icon={Info} title="앱 정보" description="두리 모바일 여행 계획 프로토타입" />
          <InfoRow icon={CircleHelp} title="이용 안내" description="각 메뉴에서 여행방, 장소와 성향 결과를 확인할 수 있어요." />
          <InfoRow icon={UserRound} title="계정 설정" description="정식 로그인 연동 후 제공할 예정이에요." badge="준비 중" />
        </div>
      </section>
    </div>
  );
}

function ProfileHeader({ user, preferenceCompleted }: { user: User; preferenceCompleted: boolean }) {
  return (
    <header className="relative overflow-hidden rounded-[30px] bg-[#4388FF] px-5 py-6 text-white shadow-[0_14px_28px_rgba(67,136,255,0.25)]">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/12" />
      <div className="relative flex min-w-0 items-center gap-4">
        <ProfileAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black text-[#D6E8FF]">마이페이지</p>
          <h1 className="mt-1 truncate text-[26px] font-black">{user.name}</h1>
          <p className="mt-1 text-[12px] font-bold text-[#DDEBFF]">{preferenceCompleted ? "개인 여행 성향 분석을 완료했어요." : "여행 성향 테스트를 기다리고 있어요."}</p>
        </div>
      </div>
    </header>
  );
}

function ProfileAvatar({ user }: { user: User }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = user.profileImageUrl?.trim();
  return (
    <span className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[25px] border-2 border-white/50 bg-white/18 text-[25px] font-black">
      {imageUrl && !imageFailed ? <img src={imageUrl} alt={`${user.name} 프로필`} onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : user.initial || "?"}
    </span>
  );
}

function MissingUserState() {
  return (
    <div className="px-5 pb-36 pt-8">
      <section className="rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_10px_24px_rgba(79,134,247,0.12)]">
        <Home size={28} className="mx-auto text-[#91BFF5]" />
        <h1 className="mt-4 text-[20px] font-black text-[#243C8F]">사용자 정보를 불러오지 못했어요.</h1>
        <p className="mt-2 text-[12px] font-bold leading-5 text-[#8CAADA]">홈으로 돌아가 다시 확인해 주세요.</p>
        <Link to="/" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[18px] bg-[#4388FF] px-6 text-[14px] font-black text-white">홈으로 돌아가기</Link>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="min-w-0"><p className="text-[11px] font-black text-[#7FADED]">{eyebrow}</p><h2 className="mt-0.5 text-[20px] font-black text-[#243C8F]">{title}</h2></div>;
}

function DashboardStat({ label, value }: { label: string; value: number }) {
  return <div className="min-w-0 rounded-[20px] bg-white px-2 py-4 text-center shadow-[0_8px_18px_rgba(79,134,247,0.09)]"><p className="truncate text-[9px] font-black text-[#9CB7DD]">{label}</p><p className="mt-1 text-[21px] font-black text-[#243C8F]">{value}</p></div>;
}

function TextLink({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="mt-4 flex min-h-11 w-full items-center justify-between rounded-[16px] bg-[#EAF3FF] px-4 text-[12px] font-black text-[#4388FF]"><span>{label}</span><ChevronRight size={17} /></Link>;
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: typeof Bookmark; label: string }) {
  return <Link to={to} className="flex min-h-[76px] min-w-0 items-center gap-3 rounded-[22px] bg-white px-4 shadow-[0_8px_18px_rgba(79,134,247,0.09)]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#EAF3FF] text-[#4388FF]"><Icon size={21} /></span><span className="truncate text-[13px] font-black text-[#243C8F]">{label}</span></Link>;
}

function InfoRow({ icon: Icon, title, description, badge }: { icon: typeof Info; title: string; description: string; badge?: string }) {
  return <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] bg-[#F1F6FF] text-[#4388FF]"><Icon size={19} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="text-[13px] font-black text-[#243C8F]">{title}</h3>{badge ? <span className="rounded-full bg-[#EDF3FA] px-2 py-1 text-[9px] font-black text-[#8BA7CF]">{badge}</span> : null}</div><p className="mt-1 text-[11px] font-bold leading-4 text-[#8CAADA]">{description}</p></div></div>;
}
