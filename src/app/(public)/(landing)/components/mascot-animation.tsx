"use client";
import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "@/../public/animations/promoflow-capybara-character.json";

export function MascotAnimation({
  paused = false,
  className = "",
}: {
  paused?: boolean;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<AnimationItem | null>(null);
  const pausedRef = useRef(paused);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updateMotion() {
      if (motion.matches) player.current?.goToAndStop(75, true);
      else if (!pausedRef.current) player.current?.play();
    }
    async function load() {
      try {
        const { default: lottie } = await import("lottie-web");
        if (disposed || !container.current) return;
        const animation = lottie.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: true,
          autoplay: !motion.matches && !pausedRef.current,
          animationData: structuredClone(animationData),
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        player.current = animation;
        animation.setSpeed(5 / 3);
        animation.addEventListener("DOMLoaded", () => {
          if (motion.matches) animation.goToAndStop(75, true);
        });
        const onFailure = () => {
          if (!disposed) setFailed(true);
        };
        animation.addEventListener("data_failed", onFailure);
        animation.addEventListener("error", onFailure);
        motion.addEventListener("change", updateMotion);
      } catch {
        if (!disposed) setFailed(true);
      }
    }
    void load();
    return () => {
      disposed = true;
      motion.removeEventListener("change", updateMotion);
      player.current?.destroy();
      player.current = null;
    };
  }, []);
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) player.current?.pause();
    else if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      player.current?.play();
  }, [paused]);
  return (
    <div className={`flow-mascot-player ${className}`} aria-hidden="true">
      <div ref={container} className="flow-mascot-player-canvas" />
      {failed && <span className="flow-capy-error">Capivara do Flow</span>}
    </div>
  );
}
