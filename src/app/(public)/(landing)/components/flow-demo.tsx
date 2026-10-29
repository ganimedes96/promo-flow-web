"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCheck,
  Headphones,
  MousePointer2,
  Puzzle,
  Send,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const stages = [
  {
    title: "Capturar",
    icon: Puzzle,
    description: "A extensão traz os dados disponíveis na página do produto.",
  },
  {
    title: "Revisar",
    icon: Check,
    description: "Você confere os preços, escolhe a imagem e coloca seu link.",
  },
  {
    title: "Agendar",
    icon: Timer,
    description: "Escolha o grupo e organize a próxima publicação na fila.",
  },
  {
    title: "Publicar",
    icon: Send,
    description: "Com o publicador local ativo, acompanhe o envio pelo painel.",
  },
];
export function FlowDemo() {
  const [stage, setStage] = useState(0);
  return (
    <div className="flow-demo">
      <div className="flow-demo-top">
        <span>
          <span className="flow-status-dot" /> LAB / FLUXO DE UMA OFERTA
        </span>
        <span>DEMO INTERATIVA</span>
      </div>
      <div className="flow-demo-stage" key={stage}>
        <div className="flow-orbit" aria-hidden="true" />
        <span className="flow-sticker">
          BOM ACHADO
          <br />
          MERECE GRUPO ↗
        </span>
        <div className="flow-product">
          <div className="flow-product-art">
            <Headphones strokeWidth={1.1} />
            <span>ÁUDIO / 01</span>
            <span className="flow-discount">−25%</span>
          </div>
          <div className="flow-product-copy">
            <span className="flow-mono">
              {stage === 0
                ? "CAPTURA DO NAVEGADOR"
                : stage === 1
                  ? "RASCUNHO EM REVISÃO"
                  : stage === 2
                    ? "NA SUA FILA"
                    : "EXEMPLO DE MENSAGEM"}
            </span>
            <h3>
              Seu próximo
              <br />
              bom achado.
            </h3>
            <div className="flow-price">
              <s>R$ 199,90</s>
              <strong>R$ 149,90</strong>
            </div>
            <p>Fone Bluetooth • Cupom SOM10</p>
            <div className="flow-product-bottom">
              <span>
                {stage < 2
                  ? "Seu link de afiliado ↗"
                  : stage === 2
                    ? "Grupo: Ofertas do dia"
                    : "Seu grupo do WhatsApp"}
              </span>
              {stage === 3 ? (
                <CheckCheck size={16} />
              ) : (
                <ArrowUpRight size={16} />
              )}
            </div>
          </div>
        </div>
        <div className="flow-floating-label">
          <span className="flow-status-dot" />
          {stage === 0
            ? "Dados capturados"
            : stage === 1
              ? "Você tem o controle"
              : stage === 2
                ? "Destino definido"
                : "Do seu jeito, no grupo"}
        </div>
        <MousePointer2 className="flow-demo-cursor" aria-hidden="true" />
      </div>
      <div
        className="flow-demo-controls"
        role="group"
        aria-label="Etapas da demonstração"
      >
        {stages.map(({ title, icon: Icon }, index) => (
          <Button
            key={title}
            variant="ghost"
            aria-pressed={stage === index}
            onClick={() => setStage(index)}
            className={stage === index ? "flow-stage-active" : ""}
          >
            <Icon size={15} />
            <span>{title}</span>
          </Button>
        ))}
      </div>
      <p className="flow-demo-caption" aria-live="polite">
        {stages[stage].description}
      </p>
      <span className="flow-demo-disclaimer">
        Produto e valores ilustrativos. Nenhuma oferta é enviada nesta
        demonstração.
      </span>
    </div>
  );
}
