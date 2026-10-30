"use client";
import { useEffect, useState } from "react";
import { MascotAnimation } from "./mascot-animation";
import {
  Pause,
  Play,
  Sparkles,
  Users,
  Headphones,
  Coffee,
  CookingPot,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ShoppingBagIcon() {
  return <span className="flow-capy-parcel-icon">↗</span>;
}

const incomingProducts = [
  {
    title: "Fone Bluetooth",
    price: "59",
    old: "129",
    discount: "54%",
    icon: Headphones,
  },
  {
    title: "Air fryer 4 L",
    price: "199",
    old: "349",
    discount: "43%",
    icon: CookingPot,
  },
  {
    title: "Cafeteira elétrica",
    price: "99",
    old: "189",
    discount: "48%",
    icon: Coffee,
  },
  {
    title: "Headset sem fio",
    price: "89",
    old: "159",
    discount: "44%",
    icon: Headphones,
  },
  {
    title: "Panela antiaderente",
    price: "79",
    old: "139",
    discount: "43%",
    icon: CookingPot,
  },
  {
    title: "Kit de xícaras",
    price: "39",
    old: "69",
    discount: "43%",
    icon: Coffee,
  },
];

export function CapybaraMascot() {
  const [paused, setPaused] = useState(false);
  const [arrival, setArrival] = useState(0);
  useEffect(() => {
    if (paused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    function syncTimer() {
      clearInterval(timer);
      if (!motion.matches)
        timer = setInterval(() => setArrival((value) => value + 1), 4800);
    }
    syncTimer();
    motion.addEventListener("change", syncTimer);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", syncTimer);
    };
  }, [paused]);
  const visibleOffers = Array.from({ length: 4 }, (_, index) => ({
    ...incomingProducts[
      (((arrival - index) % incomingProducts.length) +
        incomingProducts.length) %
        incomingProducts.length
    ],
    id: arrival - index,
  }));
  return (
    <div
      className={`flow-mascot-scene flow-mascot-v2 ${paused ? "flow-paused" : ""}`}
    >
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
        className="flow-capy-pipeline"
        role="img"
        aria-label="Ofertas chegam à esquerda, a capivara confere no centro e cartões seguem para grupos ilustrativos à direita."
      >
        <svg
          className="flow-capy-routes"
          viewBox="0 0 600 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M120 75 Q220 75 290 160 M120 160 L290 160 M120 245 Q220 245 290 160 M330 160 Q410 50 485 65 M330 160 Q420 150 485 160 M330 160 Q420 270 485 255" />
        </svg>
        <div className="flow-capy-incoming">
          <span className="flow-capy-label">
            <i />
            CHEGANDO AGORA
          </span>
          <div className="flow-capy-offers-viewport" aria-hidden="true">
            {visibleOffers.map(
              ({ title, price, old, discount, icon: Icon, id }, index) => (
                <div
                  className={`flow-capy-offer flow-capy-arrival-${index}`}
                  key={id}
                  style={{ top: `calc(var(--capy-row-step) * ${index})` }}
                >
                  <span className="flow-capy-thumbnail">
                    <Icon />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>
                      R$ {price}
                      <b>−{discount}</b>
                    </p>
                    <small>
                      de <s>R$ {old}</s>
                    </small>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div className="flow-capy-center">
          <div className="flow-capy-halo" />
          <MascotAnimation className="flow-capy-character" paused={paused} />
          <span className="flow-capy-check">
            <CheckCheck size={12} />
            Essa vale o envio!
          </span>
        </div>
        <div className="flow-capy-destinations">
          <span className="flow-capy-label">SEUS GRUPOS</span>
          {[
            {
              name: "Achadinhos da Bia",
              initials: "AB",
              product: "Fone Bluetooth por R$ 59",
            },
            {
              name: "Casa em Oferta",
              initials: "CO",
              product: "Air fryer por R$ 199",
            },
            {
              name: "Ofertas Relâmpago",
              initials: "OR",
              product: "Cafeteira por R$ 99",
            },
          ].map(({ name, initials, product }, index) => (
            <div
              className={`flow-capy-group flow-capy-group-${index}`}
              key={name}
            >
              <span className="flow-capy-avatar">{initials}</span>
              <div>
                <strong>{name}</strong>
                <span>
                  <CheckCheck size={9} />
                  enviada agora
                </span>
                <small>{product}</small>
              </div>
              <b className="flow-capy-notification">{[26, 18, 24][index]}</b>
            </div>
          ))}
        </div>
        <div className="flow-capy-flying-layer" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`flow-capy-parcel flow-capy-parcel-${index}`}
            >
              <ShoppingBagIcon />
              <b>{["R$ 59", "R$ 199", "R$ 99"][index]}</b>
            </span>
          ))}
        </div>
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
