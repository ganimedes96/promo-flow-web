"use client";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  Pause,
  Play,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MascotAnimation } from "./mascot-animation";
const stops = [
  {
    id: "apresentacao",
    name: "Boas-vindas",
    message:
      "Oi! Sou a capivara do Flow. Vem comigo conhecer o caminho de um bom achado.",
    action: "Conhecer o painel",
  },
  {
    id: "painel",
    name: "O futuro painel",
    message:
      "Aqui é uma prévia do que vem aí! Os números são ilustrativos. Vamos ver como uma oferta entra no fluxo?",
    action: "Ver as etapas",
  },
  {
    id: "como-funciona",
    name: "Como funciona",
    message:
      "Achou, revisou, agendou e acompanhou. Eu confiro com calma; você continua no controle.",
    action: "Explorar os recursos",
  },
  {
    id: "recursos",
    name: "Seus recursos",
    message:
      "Um lugar para cada tarefa. Meus favoritos? Os grupos favoritos! E uma fila bem organizada.",
    action: "Conhecer a extensão",
  },
  {
    id: "extensao",
    name: "Extensão do Chrome",
    message:
      "Viu uma boa na loja? A extensão traz os dados disponíveis. Só não esquece de conferir os preços e colocar seu link!",
    action: "Tirar minhas dúvidas",
  },
  {
    id: "duvidas",
    name: "Sem pressa",
    message:
      "Boa pergunta merece resposta. Ah, para enviar as ofertas, o publicador local precisa estar ligado.",
    action: "Próximo passo",
  },
  {
    id: "comecar",
    name: "Bora dar flow?",
    message:
      "Pronto para o primeiro achado? Entre na sua conta, conecte o WhatsApp e escolha seu grupo favorito.",
    action: "Acessar minha conta",
  },
];
export function MascotGuide() {
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (dismissed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const index = stops.findIndex(
          (stop) => stop.id === visible[0].target.id
        );
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-18% 0px -50% 0px", threshold: 0 }
    );
    stops.forEach((stop) => {
      const element = document.getElementById(stop.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [dismissed]);
  if (dismissed) return null;
  const stop = stops[active];
  const last = active === stops.length - 1;
  return (
    <aside
      className={`flow-guide ${collapsed ? "flow-guide-collapsed" : ""}`}
      aria-label="Capivara guia da página"
    >
      {!collapsed && (
        <div className="flow-guide-bubble">
          <div className="flow-guide-toolbar">
            <span>
              CAPIVARA GUIA / {active + 1} DE {stops.length}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPaused(!paused)}
              aria-label={
                paused ? "Retomar animação da guia" : "Pausar animação da guia"
              }
              aria-pressed={paused}
            >
              {paused ? <Play /> : <Pause />}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setCollapsed(true)}
              aria-label="Recolher guia"
            >
              <ChevronDown />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setDismissed(true)}
              aria-label="Fechar guia"
            >
              <X />
            </Button>
          </div>
          <div key={stop.id} className="flow-guide-text">
            <strong>{stop.name}</strong>
            <p>{stop.message}</p>
            <Link
              href={last ? "/login" : `#${stops[active + 1].id}`}
              className="flow-guide-action"
            >
              {stop.action}
              {last ? <ArrowUpRight size={12} /> : <ArrowDown size={12} />}
            </Link>
          </div>
          <div className="flow-guide-progress" aria-hidden="true">
            <i style={{ width: `${((active + 1) / stops.length) * 100}%` }} />
          </div>
        </div>
      )}
      <button
        type="button"
        className="flow-guide-character"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={
          collapsed ? "Abrir capivara guia" : "Recolher capivara guia"
        }
        aria-expanded={!collapsed}
      >
        <MascotAnimation paused={paused || collapsed} />
        <span>{collapsed ? "Posso te guiar?" : "Sua guia do Flow"}</span>
      </button>
    </aside>
  );
}
