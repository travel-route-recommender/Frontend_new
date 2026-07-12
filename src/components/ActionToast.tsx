import { CheckCircle2 } from "lucide-react";

export function ActionToast({ message, actionLabel, onAction }: { message?: string; actionLabel?: string; onAction?: () => void }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute left-1/2 top-20 z-[110] flex w-[calc(100%-48px)] -translate-x-1/2 items-center gap-2 rounded-[18px] bg-[#243C8F] px-4 py-3 text-[13px] font-black text-white shadow-[0_12px_26px_rgba(36,60,143,0.3)]"
    >
      <CheckCircle2 size={18} className="shrink-0 text-[#A9D0FF]" />
      <span className="min-w-0 flex-1">{message}</span>
      {actionLabel && onAction ? <button type="button" onClick={onAction} className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black text-white">{actionLabel}</button> : null}
    </div>
  );
}
