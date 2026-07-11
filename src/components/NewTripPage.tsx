import { ArrowLeft, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDuriStore } from "../store/useDuriStore";
import { isValidISODate } from "../utils/formatters";
import {
  CompanionStep,
  ConfirmationStep,
  DateStep,
  RegionStep,
  TravelConditionStep,
} from "./TripWizardSteps";
import type { TripDraft, TripDraftErrors } from "./TripWizardSteps";

const stepLabels = ["지역 선택", "여행 날짜", "여행 조건", "동행자", "최종 확인"] as const;

const initialDraft: TripDraft = {
  regionId: "",
  startDate: "",
  endDate: "",
  transport: "public",
  budgetLevel: "standard",
  intensity: "balanced",
  invitedUserIds: [],
  title: "",
};

export function NewTripPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<TripDraft>(initialDraft);
  const [errors, setErrors] = useState<TripDraftErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const currentUserId = useDuriStore((state) => state.currentUserId);
  const usersById = useDuriStore((state) => state.usersById);
  const regionsById = useDuriStore((state) => state.regionsById);
  const createTrip = useDuriStore((state) => state.createTrip);
  const regions = useMemo(() => Object.values(regionsById), [regionsById]);
  const companions = useMemo(
    () => Object.values(usersById).filter((user) => user.id !== currentUserId),
    [currentUserId, usersById],
  );
  const invitedUsers = useMemo(
    () => draft.invitedUserIds.flatMap((userId) => (usersById[userId] ? [usersById[userId]] : [])),
    [draft.invitedUserIds, usersById],
  );

  const updateDraft = <Key extends keyof TripDraft>(field: Key, value: TripDraft[Key]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "regionId" || field === "startDate" || field === "endDate") {
      setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
    }
  };

  const validateStep = (step: number) => {
    const nextErrors: TripDraftErrors = {};
    if (step === 0 && !regionsById[draft.regionId]) nextErrors.regionId = "여행 지역을 선택해 주세요.";
    if (step === 1) {
      if (!draft.startDate) nextErrors.startDate = "시작일을 선택해 주세요.";
      else if (!isValidISODate(draft.startDate)) nextErrors.startDate = "올바른 시작일을 입력해 주세요.";
      if (!draft.endDate) nextErrors.endDate = "종료일을 선택해 주세요.";
      else if (!isValidISODate(draft.endDate)) nextErrors.endDate = "올바른 종료일을 입력해 주세요.";
      else if (isValidISODate(draft.startDate) && draft.endDate < draft.startDate) nextErrors.endDate = "종료일은 시작일보다 빠를 수 없어요.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAll = () => {
    if (!regionsById[draft.regionId]) {
      setCurrentStep(0);
      setErrors({ regionId: "여행 지역을 선택해 주세요." });
      return false;
    }
    if (!isValidISODate(draft.startDate) || !isValidISODate(draft.endDate) || draft.endDate < draft.startDate) {
      setCurrentStep(1);
      setErrors({
        startDate: isValidISODate(draft.startDate) ? undefined : "시작일을 선택해 주세요.",
        endDate: !isValidISODate(draft.endDate)
          ? "종료일을 선택해 주세요."
          : draft.endDate < draft.startDate
            ? "종료일은 시작일보다 빠를 수 없어요."
            : undefined,
      });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, stepLabels.length - 1));
  };

  const goBack = () => {
    setErrors({});
    if (currentStep === 0) {
      navigate("/trips");
      return;
    }
    setCurrentStep((step) => step - 1);
  };

  const toggleCompanion = (userId: string) => {
    setDraft((current) => ({
      ...current,
      invitedUserIds: current.invitedUserIds.includes(userId)
        ? current.invitedUserIds.filter((id) => id !== userId)
        : [...current.invitedUserIds, userId],
    }));
  };

  const submitTrip = () => {
    if (submittingRef.current || !validateAll()) return;
    submittingRef.current = true;
    setSubmitting(true);
    setErrors({});

    const tripId = createTrip({
      title: draft.title,
      regionId: draft.regionId,
      startDate: draft.startDate,
      endDate: draft.endDate,
      transport: draft.transport,
      budgetLevel: draft.budgetLevel,
      intensity: draft.intensity,
      invitedUserIds: draft.invitedUserIds,
    });

    if (!tripId) {
      submittingRef.current = false;
      setSubmitting(false);
      setErrors({ submit: "여행방을 만들지 못했어요. 입력 내용을 다시 확인해 주세요." });
      return;
    }

    navigate(`/trips/${tripId}`);
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return <RegionStep regions={regions} selectedRegionId={draft.regionId} error={errors.regionId} onSelect={(regionId) => updateDraft("regionId", regionId)} />;
    }
    if (currentStep === 1) {
      return <DateStep startDate={draft.startDate} endDate={draft.endDate} errors={errors} onChange={(field, value) => updateDraft(field, value)} />;
    }
    if (currentStep === 2) {
      return <TravelConditionStep draft={draft} onChange={(field, value) => updateDraft(field, value)} />;
    }
    if (currentStep === 3) {
      return <CompanionStep currentUser={usersById[currentUserId]} companions={companions} selectedUserIds={draft.invitedUserIds} onToggle={toggleCompanion} />;
    }
    return (
      <ConfirmationStep
        draft={draft}
        region={regionsById[draft.regionId]}
        currentUser={usersById[currentUserId]}
        invitedUsers={invitedUsers}
        submitError={errors.submit}
        onTitleChange={(title) => updateDraft("title", title)}
      />
    );
  };

  return (
    <div className="overflow-x-hidden px-5 pb-32 pt-2">
      <header className="sticky top-0 z-20 -mx-5 bg-[#EFF5FF]/95 px-5 pb-4 pt-1 backdrop-blur">
        <div className="flex items-center justify-between">
          <button type="button" onClick={goBack} className="grid h-10 w-10 place-items-center rounded-[15px] bg-white text-[#4388FF]" aria-label={currentStep === 0 ? "내 여행방으로 돌아가기" : "이전 단계"}>
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-black text-[#7FADED]">{currentStep + 1} / {stepLabels.length}</p>
            <h1 className="mt-0.5 text-[16px] font-black text-[#243C8F]">{stepLabels[currentStep]}</h1>
          </div>
          <Link to="/trips" className="grid h-10 w-10 place-items-center rounded-[15px] bg-white text-[#8CAADA]" aria-label="새 여행방 만들기 취소">
            <X size={19} />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {stepLabels.map((label, index) => (
            <span key={label} className={`h-1.5 rounded-full ${index <= currentStep ? "bg-[#4388FF]" : "bg-[#D8E6F8]"}`} />
          ))}
        </div>
      </header>

      <div className="pt-5">{renderStep()}</div>

      <div className="-mx-1 mt-7 grid grid-cols-2 gap-3 rounded-[24px] bg-white p-3 shadow-[0_12px_28px_rgba(79,134,247,0.18)]">
        <button type="button" onClick={goBack} className="flex h-12 items-center justify-center gap-1.5 rounded-[17px] bg-[#F1F6FF] text-[14px] font-black text-[#4388FF]">
          <ChevronLeft size={17} />
          {currentStep === 0 ? "취소" : "이전"}
        </button>
        {currentStep < stepLabels.length - 1 ? (
          <button type="button" onClick={goNext} className="flex h-12 items-center justify-center gap-1.5 rounded-[17px] bg-[#4388FF] text-[14px] font-black text-white shadow-[0_8px_16px_rgba(67,136,255,0.22)]">
            다음<ChevronRight size={17} />
          </button>
        ) : (
          <button type="button" onClick={submitTrip} disabled={submitting} className="flex h-12 items-center justify-center gap-1.5 rounded-[17px] bg-[#4388FF] text-[14px] font-black text-white shadow-[0_8px_16px_rgba(67,136,255,0.22)] disabled:bg-[#A9C6EE]">
            <Check size={17} />{submitting ? "만드는 중" : "여행방 만들기"}
          </button>
        )}
      </div>
    </div>
  );
}
