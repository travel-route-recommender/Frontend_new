import { useEffect, useRef } from "react";

export function useDialogBehavior(onClose: () => void, enabled = true) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCloseRef.current();
    };
    const appScrollRoot = document.querySelector<HTMLElement>("[data-app-scroll-root]");
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = appScrollRoot?.style.overflow;
    document.body.style.overflow = "hidden";
    if (appScrollRoot) appScrollRoot.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (appScrollRoot) appScrollRoot.style.overflow = previousRootOverflow ?? "";
    };
  }, [enabled]);
}
