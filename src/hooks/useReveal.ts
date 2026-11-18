import { useEffect, useRef, useState } from "react";

type RevealDirection = "up" | "left" | "right" | "none";

export function useReveal(direction: RevealDirection = "up", delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const transforms: Record<RevealDirection, string> = {
    up: "translateY(24px)",
    left: "translateX(-24px)",
    right: "translateX(24px)",
    none: "none",
  };

  const style: React.CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? "none" : transforms[direction],
    transition: `opacity 0.6s ease-out, transform 0.6s ease-out`,
  };

  return { ref, style, revealed };
}
