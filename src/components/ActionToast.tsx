import { CheckCircle2 } from "lucide-react";

export function ActionToast({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute left-1/2 top-20 z-[80] flex w-[calc(100%-48px)] -translate-x-1/2 items-center gap-2 rounded-[18px] bg-[#243C8F] px-4 py-3 text-[13px] font-black text-white shadow-[0_12px_26px_rgba(36,60,143,0.3)]"
    >
      <CheckCircle2 size={18} className="shrink-0 text-[#A9D0FF]" />
      <span>{message}</span>
    </div>
  );
}
