import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="px-5 pb-32 pt-16">
      <section className="rounded-[28px] bg-white px-5 py-8 text-center shadow-[0_12px_26px_rgba(79,134,247,0.12)]">
        <p className="text-[13px] font-black text-[#7FADED]">404</p>
        <h1 className="mt-2 text-[24px] font-black text-[#243C8F]">페이지를 찾을 수 없어요</h1>
        <p className="mt-3 text-[14px] font-bold leading-6 text-[#7898CE]">주소를 다시 확인하거나 홈으로 이동해 주세요.</p>
        <Link
          to="/"
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#4388FF] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(67,136,255,0.28)]"
        >
          홈으로 이동
        </Link>
      </section>
    </div>
  );
}
