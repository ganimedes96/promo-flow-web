"use client";
import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "@/../public/animations/promoflow-capybara-onboarding.json";
export function GuideMascot({ paused }: { paused: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<AnimationItem | null>(null);
  const pauseRef = useRef(paused);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (motion.matches) player.current?.goToAndStop(0, true);
      else if (pauseRef.current) player.current?.pause();
      else player.current?.play();
    };
    void import("lottie-web")
      .then(({ default: lottie }) => {
        if (disposed || !container.current) return;
        const animation = lottie.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: true,
          autoplay: false,
          animationData: structuredClone(animationData),
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        player.current = animation;
        animation.addEventListener("DOMLoaded", sync);
        animation.addEventListener("data_failed", () => {
          if (!disposed) setFailed(true);
        });
        animation.addEventListener("error", () => {
          if (!disposed) setFailed(true);
        });
        motion.addEventListener("change", sync);
        sync();
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      motion.removeEventListener("change", sync);
      player.current?.destroy();
      player.current = null;
    };
  }, []);
  useEffect(() => {
    pauseRef.current = paused;
    if (paused) player.current?.pause();
    else if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      player.current?.play();
  }, [paused]);
  return (
    <div className="relative h-52 w-48 shrink-0" aria-hidden="true">
      <div
        ref={container}
        className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full"
      />
      {failed && (
        <div className="flex h-full items-center justify-center text-7xl">
          🦫
        </div>
      )}
    </div>
  );
}
