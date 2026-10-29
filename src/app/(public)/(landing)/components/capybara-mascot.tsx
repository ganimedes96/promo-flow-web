"use client";
import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import { Pause, Play, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CapybaraMascot() {
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<AnimationItem | null>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const pausedRef = useRef(false);
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
          path: "/animations/promoflow-capybara.json",
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        player.current = animation;
        animation.addEventListener("DOMLoaded", () => {
          if (motion.matches) animation.goToAndStop(75, true);
        });
        animation.addEventListener("data_failed", () => {
          if (!disposed) setFailed(true);
        });
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
    <div className="flow-mascot-scene">
      <div className="flow-mascot-heading">
        <span>
          <Sparkles size={13} />
          CONHEÇA A CAPIVARA DO FLOW
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-label={
            paused
              ? "Retomar animação da capivara"
              : "Pausar animação da capivara"
          }
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </Button>
      </div>
      <div
        className="flow-mascot-art"
        role="img"
        aria-label="Capivara de boné verde recebe uma oferta, confere e lança cartões de promoções para três grupos ilustrativos."
      >
        <div ref={container} aria-hidden="true" />
        {failed && (
          <p className="flow-mascot-fallback">
            A capivara está preparando os próximos achados. Recarregue para ver
            a animação.
          </p>
        )}
        <span className="flow-mascot-source">BONS ACHADOS ↗</span>
        <span className="flow-mascot-groups">SEUS GRUPOS</span>
      </div>
      <div className="flow-mascot-caption">
        <strong>Ela confere. A boa ganha destino.</strong>
        <p>Uma capivara tranquila para uma rotina com mais flow.</p>
      </div>
      <div className="flow-mascot-future">
        <Users size={16} />
        <span>
          Vários grupos conectados <b>NO FUTURO</b>
        </span>
      </div>
      <p className="flow-mascot-note">
        Animação conceitual. Seleção automática e distribuição para vários
        grupos ainda não estão disponíveis.
      </p>
    </div>
  );
}
