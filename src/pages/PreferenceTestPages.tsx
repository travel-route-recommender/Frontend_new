import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Home,
  RotateCcw,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PreferenceScore } from "../domain";
import {
  isCompletePersonalPreferenceAnswers,
  personalTestQuestions,
  preferenceDimensionLabels,
} from "../features/preferences";
import type { PersonalPreferenceDraft } from "../features/preferences";
import { useDuriStore } from "../store/useDuriStore";

function TestPageHeader({ backTo, eyebrow, title, description }: { backTo: string; eyebrow: string; title: string; description: string }) {
  return (
    <header>
      <Link to={backTo} className="inline-flex h-10 items-center gap-1 rounded-full bg-white px-3 text-[11px] font-black text-[#6F95D0] shadow-[0_6px_14px_rgba(79,134,247,0.1)]">
        <ArrowLeft size={14} /> 뒤로 가기
      </Link>
      <p className="mt-5 text-[11px] font-black text-[#4388FF]">{eyebrow}</p>
      <h1 className="mt-1 text-[26px] font-black leading-tight text-[#213D90]">{title}</h1>
      <p className="mt-2 text-[12px] font-bold leading-5 text-[#7898CE]">{description}</p>
    </header>
  );
}

export function PreferenceTestHomePage() {
  const result = useDuriStore((state) => state.preferenceResultsByUserId[state.currentUserId]);

  return (
    <div className="px-5 pb-32 pt-3">
      <TestPageHeader backTo="/" eyebrow="두리 테스트" title="내 여행 취향 알아보기" description="짧은 여섯 문항으로 여행할 때 중요하게 생각하는 기준을 정리해요." />

      <section className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_12px_26px_rgba(79,134,247,0.13)]">
        <div className="bg-[#4388FF] px-5 py-6 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-white/18"><UserRound size={23} /></span>
          <p className="mt-4 text-[11px] font-black text-[#D9E9FF]">개인 여행 성향 테스트 · 6문항</p>
          <h2 className="mt-1 text-[20px] font-black">{result ? result.profileType : "아직 테스트 전이에요"}</h2>
          <p className="mt-2 text-[12px] font-bold leading-5 text-[#DDEBFF]">{result ? "현재 결과를 확인하거나 새로운 응답으로 다시 테스트할 수 있어요." : "응답은 마지막 문항을 완료했을 때만 저장돼요."}</p>
        </div>
        <div className="space-y-2 p-4">
          <Link to={result ? "/tests/personal/result" : "/tests/personal"} className="flex h-12 items-center justify-between rounded-[17px] bg-[#243C8F] px-4 text-[12px] font-black text-white">
            <span>{result ? "현재 결과 보기" : "개인 테스트 시작"}</span><ArrowRight size={16} />
          </Link>
          {result ? <Link to="/tests/personal" className="flex h-11 items-center justify-center gap-1 rounded-[16px] bg-[#EEF5FF] text-[11px] font-black text-[#4388FF]"><RotateCcw size={14} /> 다시 테스트하기</Link> : null}
        </div>
      </section>

      <section className="mt-4 rounded-[24px] border border-[#DFEAF8] bg-white p-5 opacity-75 shadow-[0_8px_18px_rgba(79,134,247,0.08)]">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#EEF5FF] text-[#7FADED]"><UsersRound size={20} /></span>
          <div><span className="rounded-full bg-[#EDF3FA] px-2 py-1 text-[9px] font-black text-[#8BA7CF]">준비 중</span><h2 className="mt-2 text-[15px] font-black text-[#213D90]">여행방 궁합 테스트</h2><p className="mt-1 text-[10px] font-bold leading-4 text-[#7898CE]">동행자 응답 현황과 그룹 진단은 다음 단계에서 연결할 예정이에요.</p></div>
        </div>
      </section>
    </div>
  );
}

export function PersonalPreferenceTestPage() {
  const navigate = useNavigate();
  const currentUserId = useDuriStore((state) => state.currentUserId);
  const savePersonalPreferenceResult = useDuriStore((state) => state.savePersonalPreferenceResult);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalPreferenceDraft>({});
  const question = personalTestQuestions[questionIndex];
  const selectedValue = answers[question.dimension];
  const isLast = questionIndex === personalTestQuestions.length - 1;

  const moveNext = () => {
    if (selectedValue === undefined) return;
    if (!isLast) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    if (!isCompletePersonalPreferenceAnswers(answers)) return;
    const saved = savePersonalPreferenceResult(currentUserId, answers);
    if (saved) navigate("/tests/personal/result");
  };

  return (
    <div className="px-5 pb-32 pt-3">
      <TestPageHeader backTo="/tests" eyebrow="개인 여행 성향" title="나에게 편한 여행은?" description="정답은 없어요. 지금 더 마음이 가는 선택지를 골라주세요." />

      <section className="mt-6">
        <div className="flex items-center justify-between text-[11px] font-black text-[#7197CF]"><span>진행률</span><span>{questionIndex + 1} / {personalTestQuestions.length}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#DCE9FA]"><div className="h-full rounded-full bg-[#4388FF] transition-[width]" style={{ width: `${((questionIndex + 1) / personalTestQuestions.length) * 100}%` }} /></div>
      </section>

      <section className="mt-5 rounded-[28px] bg-white p-5 shadow-[0_12px_26px_rgba(79,134,247,0.13)]">
        <span className="inline-flex rounded-full bg-[#EAF3FF] px-3 py-1.5 text-[10px] font-black text-[#4388FF]">{preferenceDimensionLabels[question.dimension]}</span>
        <h2 className="mt-4 text-[21px] font-black leading-8 text-[#213D90]">{question.question}</h2>
        <div className="mt-5 space-y-3">
          {question.choices.map((choice) => {
            const selected = selectedValue === choice.value;
            return (
              <button key={choice.value} type="button" aria-pressed={selected} onClick={() => setAnswers((current) => ({ ...current, [question.dimension]: choice.value }))} className={`flex w-full items-start gap-3 rounded-[20px] border p-4 text-left transition ${selected ? "border-[#4388FF] bg-[#EDF5FF] shadow-[0_8px_16px_rgba(67,136,255,0.12)]" : "border-[#E2ECF8] bg-white"}`}>
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-[#4388FF] bg-[#4388FF] text-white" : "border-[#C9D9EE] text-transparent"}`}><Check size={13} /></span>
                <span><span className="block text-[13px] font-black leading-5 text-[#243C8F]">{choice.label}</span><span className="mt-1 block text-[10px] font-bold leading-4 text-[#7898CE]">{choice.description}</span></span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(index - 1, 0))} className="h-12 rounded-[18px] bg-white text-[12px] font-black text-[#6F95D0] disabled:cursor-not-allowed disabled:text-[#C2D1E5]">이전</button>
        <button type="button" disabled={selectedValue === undefined} onClick={moveNext} className="flex h-12 items-center justify-center gap-1 rounded-[18px] bg-[#4388FF] text-[12px] font-black text-white disabled:cursor-not-allowed disabled:bg-[#C5D6ED]">{isLast ? "결과 보기" : "다음"}<ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

const profileDescription: Record<string, string> = {
  "여유로운 여행자": "머무는 시간과 가까운 동선을 소중하게 생각하는 편이에요.",
  "균형형 여행자": "관광과 휴식, 계획과 유연함을 적절히 섞는 편이에요.",
  "알찬 여행자": "다양한 장소와 활동을 적극적으로 경험하는 편이에요.",
};

export function PersonalPreferenceResultPage() {
  const result = useDuriStore((state) => state.preferenceResultsByUserId[state.currentUserId]);

  if (!result) {
    return (
      <div className="px-5 pb-32 pt-3">
        <TestPageHeader backTo="/tests" eyebrow="개인 여행 성향" title="아직 저장된 결과가 없어요" description="여섯 문항을 완료하면 내 여행 취향 결과를 확인할 수 있어요." />
        <Link to="/tests/personal" className="mt-7 flex h-13 items-center justify-center gap-2 rounded-[19px] bg-[#4388FF] text-[13px] font-black text-white"><Sparkles size={16} /> 테스트 시작</Link>
      </div>
    );
  }

  return (
    <div className="px-5 pb-32 pt-3">
      <TestPageHeader backTo="/tests" eyebrow={`개인 결과 · v${result.version}`} title={result.profileType} description={profileDescription[result.profileType] ?? "현재 응답을 바탕으로 여행 취향을 정리했어요."} />

      <section className="mt-6 rounded-[28px] bg-[#4388FF] p-5 text-white shadow-[0_12px_26px_rgba(67,136,255,0.22)]">
        <p className="text-[10px] font-black text-[#D6E8FF]">주요 성향</p>
        <div className="mt-3 flex flex-wrap gap-2">{result.traits.map((trait) => <span key={trait} className="rounded-full bg-white/16 px-3 py-2 text-[10px] font-black">{trait}</span>)}</div>
        <p className="mt-4 text-[10px] font-bold text-[#DDEBFF]">선호 태그 · {result.preferredTags.join(" · ")}</p>
      </section>

      <section className="mt-4 space-y-3">
        {personalTestQuestions.map((question) => {
          const score = result.answers[question.dimension];
          const choice = question.choices.find((entry) => entry.value === score);
          return (
            <article key={question.id} className="rounded-[20px] bg-white p-4 shadow-[0_7px_16px_rgba(79,134,247,0.09)]">
              <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-black text-[#7898CE]">{preferenceDimensionLabels[question.dimension]}</p><p className="text-right text-[11px] font-black text-[#243C8F]">{choice?.label ?? "응답 없음"}</p></div>
              <div className="mt-3 grid grid-cols-3 gap-1.5" role="img" aria-label={`${preferenceDimensionLabels[question.dimension]} 3단계 중 ${score + 1}단계`}>{[0, 1, 2].map((level) => <span key={level} className={`h-2 rounded-full ${level <= score ? "bg-[#4388FF]" : "bg-[#DCE8F8]"}`} />)}</div>
            </article>
          );
        })}
      </section>

      <div className="mt-5 space-y-2">
        <Link to="/tests/personal" className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#243C8F] text-[12px] font-black text-white"><RotateCcw size={15} /> 다시 테스트하기</Link>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/trips" className="flex h-11 items-center justify-center gap-1 rounded-[16px] bg-white text-[11px] font-black text-[#4388FF]"><Building2 size={14} /> 내 여행방 보기</Link>
          <Link to="/" className="flex h-11 items-center justify-center gap-1 rounded-[16px] bg-white text-[11px] font-black text-[#4388FF]"><Home size={14} /> 홈으로 이동</Link>
        </div>
      </div>
    </div>
  );
}
