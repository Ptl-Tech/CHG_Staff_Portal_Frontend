import { useEffect } from "react";

export function useIdleTimer(onIdle: () => void, timeout: number) {
  useEffect(() => {
let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onIdle, timeout);
    };

    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);

    reset(); 

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [onIdle, timeout]);
}
