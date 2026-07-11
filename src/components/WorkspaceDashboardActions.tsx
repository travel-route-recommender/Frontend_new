import { Check, Sparkles } from "lucide-react";

type WorkspaceDashboardActionsProps = {
  scheduledCount: number;
  unplannedCount: number;
  onSuggest: () => void;
};

export function WorkspaceDashboardActions({ scheduledCount, unplannedCount, onSuggest }: WorkspaceDashboardActionsProps) {
  return (
    <section
      className="overflow-hidden rounded-[32px] bg-[#16285F] p-5 text-white shadow-[0_16px_26px_rgba(47,75,150,0.24)]"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(22,40,95,0.95), rgba(38,76,168,0.72)), radial-gradient(circle at 72% 22%, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at 28% 84%, rgba(78,134,247,0.42), transparent 32%)",
      }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-black text-white/72">여행 대시보드 ✨</p>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-white/18 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
            초안 저장됨
          </span>
        </div>
        <h2 className="mt-3 whitespace-nowrap text-[24px] font-black leading-tight tracking-normal">일정 작업 바로가기</h2>
      </div>

      <div className="grid grid-cols-[1fr_1.15fr] gap-2">
        <button
          onClick={onSuggest}
          className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white/16 text-[14px] font-black text-white ring-1 ring-white/20 transition hover:bg-white/22"
        >
          <Sparkles size={17} strokeWidth={2.3} />
          두리 제안
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-[18px] bg-white text-[14px] font-black text-[#2442B7] transition hover:bg-[#EDF4FF]">
          <Check size={17} strokeWidth={2.5} />
          최종 일정 반영
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-white/20 px-4 py-2 text-[12px] font-black backdrop-blur">반영 {scheduledCount}곳</span>
        <span className="rounded-full bg-white/20 px-4 py-2 text-[12px] font-black backdrop-blur">미배치 {unplannedCount}곳</span>
      </div>
    </section>
  );
}
