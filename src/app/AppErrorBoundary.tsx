import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Duri 화면 렌더링 오류", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="grid min-h-dvh place-items-center bg-[#D5E6FF] px-6 py-10 text-center text-[#243C8F]">
        <section className="w-full max-w-[390px] rounded-[30px] bg-white px-6 py-10 shadow-[0_18px_40px_rgba(79,134,247,0.18)]">
          <p className="text-[12px] font-black text-[#7FADED]">잠시 문제가 생겼어요</p>
          <h1 className="mt-2 text-[22px] font-black">화면을 불러오는 중 문제가 발생했어요.</h1>
          <p className="mt-3 text-[13px] font-bold leading-5 text-[#7898CE]">다시 시도하거나 홈에서 흐름을 이어가 주세요.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a href="/" className="flex min-h-12 items-center justify-center rounded-[18px] bg-[#F1F6FF] px-3 text-[13px] font-black text-[#4388FF]">홈으로 이동</a>
            <button type="button" onClick={() => window.location.reload()} className="min-h-12 rounded-[18px] bg-[#4388FF] px-3 text-[13px] font-black text-white">다시 시도</button>
          </div>
        </section>
      </main>
    );
  }
}
