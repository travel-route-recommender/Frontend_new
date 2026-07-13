import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  compact?: boolean;
  className?: string;
};

export function EmptyState({ title, description, actionLabel, actionTo, onAction, icon: Icon, compact = false, className = "" }: EmptyStateProps) {
  const actionClass = "mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[16px] bg-[#EAF3FF] px-5 text-[12px] font-black text-[#4388FF]";
  return (
    <div className={`rounded-[24px] bg-white text-center shadow-[0_8px_18px_rgba(79,134,247,0.09)] ${compact ? "px-4 py-5" : "px-5 py-7"} ${className}`}>
      {Icon ? <span className="mx-auto grid h-12 w-12 place-items-center rounded-[17px] bg-[#EAF3FF] text-[#4388FF]"><Icon size={21} /></span> : null}
      <h3 className={`${Icon ? "mt-3" : ""} text-[15px] font-black text-[#243C8F]`}>{title}</h3>
      <p className="mt-1 text-[11px] font-bold leading-5 text-[#8CAADA]">{description}</p>
      {actionTo ? (
        <Link to={actionTo} className={actionClass}>{actionLabel}<ArrowRight size={14} /></Link>
      ) : (
        <button type="button" onClick={onAction} className={actionClass}>{actionLabel}<ArrowRight size={14} /></button>
      )}
    </div>
  );
}
