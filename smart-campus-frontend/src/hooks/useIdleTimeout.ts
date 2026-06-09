import { useEffect, useRef } from "react";

export function useIdleTimeout(onTimeout: () => void, timeoutMs = 15 * 60 * 1000) {
  const timerId = useRef<number | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerId.current !== null) {
        window.clearTimeout(timerId.current);
      }
      timerId.current = window.setTimeout(onTimeout, timeoutMs);
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    resetTimer();

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      if (timerId.current !== null) {
        window.clearTimeout(timerId.current);
      }
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, [onTimeout, timeoutMs]);
}
