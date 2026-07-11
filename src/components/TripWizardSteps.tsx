import {
  Bus,
  Car,
  Check,
  Crown,
  Footprints,
  Gauge,
  MapPin,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  Region,
  TripBudgetLevel,
  TripIntensity,
  TripTransport,
  User,
} from "../domain";
import { formatTripDateRange } from "../utils/formatters";

export type TripDraft = {
  regionId: string;
  startDate: string;
  endDate: string;
  transport: TripTransport;
  budgetLevel: TripBudgetLevel;
  intensity: TripIntensity;
  invitedUserIds: string[];
  title: string;
};

export type TripDraftErrors = Partial<Record<"regionId" | "startDate" | "endDate" | "submit", string>>;

export const transportLabels: Record<TripTransport, string> = {
  public: "대중교통",
  car: "자가용",
  walking: "도보 중심",
};

export const budgetLabels: Record<TripBudgetLevel, string> = {
  budget: "절약형",
  standard: "보통",
  premium: "여유형",
};

export const intensityLabels: Record<TripIntensity, string> = {
  relaxed: "여유롭게",
  balanced: "균형 있게",
  packed: "알차게",
};

export function RegionStep({
  regions,
  selectedRegionId,
  error,
  onSelect,
}: {
  regions: Region[];
  selectedRegionId: string;
  error?: string;
  onSelect: (regionId: string) => void;
}) {
  return (
    <StepLayout title="어디로 떠날까요?" description="여행방에서 함께 계획할 지역을 선택해 주세요.">
      <div className="space-y-3">
        {regions.map((region) => {
          const selected = selectedRegionId === region.id;
          return (
            <button
              type="button"
              key={region.id}
              onClick={() => onSelect(region.id)}
              className={`w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0_8px_18px_rgba(79,134,247,0.1)] transition ${
                selected ? "ring-2 ring-[#4388FF]" : "ring-1 ring-[#E0EBFA]"
              }`}
            >
              <div
                className="relative h-28 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(25,48,112,0.05), rgba(25,48,112,0.35)), url(${region.imageUrl})` }}
              >
                {selected ? (
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#4388FF] text-white shadow-lg">
                    <Check size={18} strokeWidth={2.7} />
                  </span>
                ) : null}
              </div>
              <div className="flex items-start gap-3 px-4 py-4">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[15px] bg-[#EAF3FF] text-[#4388FF]">
                  <MapPin size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-black text-[#243C8F]">{region.name}</h3>
                  <p className="mt-1 text-[12px] font-bold leading-5 text-[#7898CE]">{region.description}</p>
                  <p className="mt-2 text-[11px] font-black text-[#8CB9EF]">관광지 {region.spots}곳 · {region.weather}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {error ? <FieldError message={error} /> : null}
    </StepLayout>
  );
}

export function DateStep({
  startDate,
  endDate,
  errors,
  onChange,
}: {
  startDate: string;
  endDate: string;
  errors: TripDraftErrors;
  onChange: (field: "startDate" | "endDate", value: string) => void;
}) {
  return (
    <StepLayout title="언제 떠날까요?" description="시작일과 종료일을 선택해 주세요. 과거 일정도 기록할 수 있어요.">
      <div className="space-y-4 rounded-[26px] bg-white p-5 shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
        <DateField label="시작일" value={startDate} error={errors.startDate} onChange={(value) => onChange("startDate", value)} />
        <DateField label="종료일" value={endDate} error={errors.endDate} onChange={(value) => onChange("endDate", value)} min={startDate || undefined} />
      </div>
    </StepLayout>
  );
}

export function TravelConditionStep({
  draft,
  onChange,
}: {
  draft: TripDraft;
  onChange: <Key extends "transport" | "budgetLevel" | "intensity">(field: Key, value: TripDraft[Key]) => void;
}) {
  return (
    <StepLayout title="어떤 여행을 원하나요?" description="기본 조건은 나중에 여행방에서 다시 조율할 수 있어요.">
      <div className="space-y-5">
        <OptionGroup
          title="이동수단"
          icon={Bus}
          value={draft.transport}
          options={[
            { value: "public", label: "대중교통", description: "버스와 지하철 중심" },
            { value: "car", label: "자가용", description: "차량 이동 중심" },
            { value: "walking", label: "도보 중심", description: "걷기 좋은 동선" },
          ]}
          onSelect={(value) => onChange("transport", value as TripTransport)}
        />
        <OptionGroup
          title="예산 수준"
          icon={WalletCards}
          value={draft.budgetLevel}
          options={[
            { value: "budget", label: "절약형", description: "합리적인 비용 우선" },
            { value: "standard", label: "보통", description: "비용과 경험의 균형" },
            { value: "premium", label: "여유형", description: "좋은 경험에 투자" },
          ]}
          onSelect={(value) => onChange("budgetLevel", value as TripBudgetLevel)}
        />
        <OptionGroup
          title="일정 강도"
          icon={Gauge}
          value={draft.intensity}
          options={[
            { value: "relaxed", label: "여유롭게", description: "하루 1~2곳" },
            { value: "balanced", label: "균형 있게", description: "하루 2~3곳" },
            { value: "packed", label: "알차게", description: "다양한 장소 방문" },
          ]}
          onSelect={(value) => onChange("intensity", value as TripIntensity)}
        />
      </div>
    </StepLayout>
  );
}

export function CompanionStep({
  currentUser,
  companions,
  selectedUserIds,
  onToggle,
}: {
  currentUser?: User;
  companions: User[];
  selectedUserIds: string[];
  onToggle: (userId: string) => void;
}) {
  return (
    <StepLayout title="누구와 함께하나요?" description="동행자는 선택 사항이에요. 지금 선택하지 않아도 나중에 초대할 수 있어요.">
      {currentUser ? (
        <div className="mb-4 rounded-[22px] bg-[#4388FF] px-4 py-4 text-white shadow-[0_10px_20px_rgba(67,136,255,0.22)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/18 text-[15px] font-black">{currentUser.initial}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-[#D9E9FF]">여행방 만든 사람</p>
              <p className="mt-0.5 text-[16px] font-black">{currentUser.name}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-white/18 px-3 py-1.5 text-[11px] font-black"><Crown size={13} />Owner</span>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {companions.map((user) => {
          const selected = selectedUserIds.includes(user.id);
          return (
            <button
              type="button"
              key={user.id}
              onClick={() => onToggle(user.id)}
              className={`flex w-full items-center gap-3 rounded-[22px] bg-white px-4 py-4 text-left shadow-[0_8px_18px_rgba(79,134,247,0.08)] transition ${
                selected ? "ring-2 ring-[#4388FF]" : "ring-1 ring-[#E0EBFA]"
              }`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#EAF3FF] text-[15px] font-black text-[#4388FF]">{user.initial}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-black text-[#243C8F]">{user.name}</p>
                <p className="mt-0.5 text-[11px] font-bold text-[#8CAADA]">동행자로 초대</p>
              </div>
              <span className={`grid h-8 w-8 place-items-center rounded-full ${selected ? "bg-[#4388FF] text-white" : "bg-[#F1F6FF] text-[#A1BCE2]"}`}>
                {selected ? <Check size={16} strokeWidth={2.7} /> : <UserRound size={15} />}
              </span>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}

export function ConfirmationStep({
  draft,
  region,
  currentUser,
  invitedUsers,
  submitError,
  onTitleChange,
}: {
  draft: TripDraft;
  region?: Region;
  currentUser?: User;
  invitedUsers: User[];
  submitError?: string;
  onTitleChange: (title: string) => void;
}) {
  const defaultTitle = `${region?.name ?? "새로운"} 여행`;
  const participantNames = [currentUser, ...invitedUsers].flatMap((user) => (user ? [user.name] : []));

  return (
    <StepLayout title="이대로 여행방을 만들까요?" description="입력한 내용을 확인하고 여행방 이름을 정해 주세요.">
      <div className="rounded-[26px] bg-white p-5 shadow-[0_8px_18px_rgba(79,134,247,0.1)]">
        <label className="block">
          <span className="text-[12px] font-black text-[#6F8AC2]">여행방 제목</span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={40}
            placeholder={defaultTitle}
            className="mt-2 h-[52px] w-full rounded-[18px] border border-[#D9E7FA] bg-[#F8FBFF] px-4 py-3 text-[15px] font-black text-[#243C8F] outline-none placeholder:text-[#B4CAE8] focus:border-[#4388FF]"
          />
          <span className="mt-1.5 block text-[11px] font-bold text-[#9CB7DD]">비워두면 “{defaultTitle}”으로 만들어져요.</span>
        </label>

        <div className="mt-5 space-y-3 border-t border-[#E4EDFA] pt-5">
          <SummaryRow label="여행방" value={draft.title.trim() || defaultTitle} />
          <SummaryRow label="지역" value={region?.name ?? "선택 전"} />
          <SummaryRow label="날짜" value={formatTripDateRange(draft.startDate, draft.endDate)} />
          <SummaryRow label="이동수단" value={transportLabels[draft.transport]} />
          <SummaryRow label="예산" value={budgetLabels[draft.budgetLevel]} />
          <SummaryRow label="일정 강도" value={intensityLabels[draft.intensity]} />
          <SummaryRow label="참여자" value={participantNames.join(", ") || "현재 사용자"} />
        </div>
      </div>
      {submitError ? <FieldError message={submitError} /> : null}
    </StepLayout>
  );
}

function StepLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[24px] font-black leading-tight text-[#243C8F]">{title}</h2>
      <p className="mt-2 text-[13px] font-bold leading-5 text-[#7898CE]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DateField({
  label,
  value,
  error,
  min,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-black text-[#6F8AC2]">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-[52px] w-full rounded-[18px] border bg-[#F8FBFF] px-4 py-3 text-[15px] font-black text-[#243C8F] outline-none focus:border-[#4388FF] ${
          error ? "border-[#F38A8A]" : "border-[#D9E7FA]"
        }`}
      />
      {error ? <span className="mt-1.5 block text-[11px] font-bold text-[#D9536F]">{error}</span> : null}
    </label>
  );
}

function OptionGroup({
  title,
  icon: Icon,
  value,
  options,
  onSelect,
}: {
  title: string;
  icon: LucideIcon;
  value: string;
  options: Array<{ value: string; label: string; description: string }>;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_18px_rgba(79,134,247,0.08)]">
      <div className="flex items-center gap-2 text-[#243C8F]"><Icon size={18} className="text-[#4388FF]" /><h3 className="text-[15px] font-black">{title}</h3></div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`min-w-0 rounded-[17px] px-2 py-3 text-center transition ${selected ? "bg-[#4388FF] text-white" : "bg-[#F1F6FF] text-[#6F8AC2]"}`}
            >
              <span className="block truncate text-[12px] font-black">{option.label}</span>
              <span className={`mt-1 block text-[9px] font-bold leading-3 ${selected ? "text-[#DDEBFF]" : "text-[#9CB7DD]"}`}>{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[12px] font-black text-[#9CB7DD]">{label}</span>
      <span className="text-right text-[13px] font-black text-[#243C8F]">{value}</span>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="mt-3 rounded-[16px] bg-[#FFF0F2] px-4 py-3 text-[12px] font-bold text-[#D9536F]">{message}</p>;
}
