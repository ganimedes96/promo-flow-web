import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CapybaraMascot } from "./capybara-mascot";
export function Hero() {
  return (
    <section className="flow-hero">
      <div className="flow-hero-grid" aria-hidden="true" />
      <div className="flow-hero-inner">
        <div className="flow-hero-copy">
          <span className="flow-eyebrow">
            <Sparkles size={14} /> BOAS OFERTAS. OUTRO RITMO.
          </span>
          <h1>
            Achou.
            <br />
            <span>Preparou.</span>
            <br />
            <em>Deu flow.</em>
          </h1>
          <p>
            Transforme aquele achado do navegador em uma oferta pronta para o
            WhatsApp. Menos trabalho repetido. Mais tempo para encontrar a
            próxima boa.
          </p>
          <div className="flow-hero-actions">
            <Button asChild size="lg" className="flow-primary-button">
              <Link href="/login">
                Entrar no fluxo
                <ArrowUpRight />
              </Link>
            </Button>
            <a href="#como-funciona" className="flow-text-link">
              Explorar o PromoFlow
              <ArrowDown size={16} />
            </a>
          </div>
          <div className="flow-store-list">
            <span>DA SUA ABA PARA O GRUPO</span>
            <div>
              Mercado Livre
              <i />
              Amazon Brasil
              <i />
              WhatsApp
            </div>
          </div>
        </div>
        <CapybaraMascot />
      </div>
      <div
        className="flow-ticker"
        aria-label="Capture, revise, agende e compartilhe"
      >
        <div aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              BOM ACHADO <b>↗</b> MENOS CLIQUES <b>✳</b> MAIS FLOW <b>↗</b> SEU
              LINK, SEU GRUPO <b>✳</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
