import { useEffect, useRef, useState } from "react";

function shouldAnimate() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Smoothly animates a number from its previous value to `target`.
 * Returns the target directly when the user prefers reduced motion
 * (or the environment has no matchMedia, e.g. tests).
 */
export function useCountUp(target: number, duration = 900) {
  const [animate] = useState(shouldAnimate);
  const [value, setValue] = useState(animate ? 0 : target);
  const fromRef = useRef(value);

  useEffect(() => {
    if (!animate) return;

    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const next = t === 1 ? target : from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, target, duration]);

  return animate ? value : target;
}
