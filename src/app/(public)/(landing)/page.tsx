import { unbounded } from "@/fonts";
import "./landing.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./components/dashboard-preview";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Started } from "./components/started";
import { MascotGuide } from "./components/mascot-guide";
import { Footer } from "./components/footer";
export const metadata: Metadata = {
  title: "Organize suas ofertas e publique no WhatsApp",
  description:
    "Capture produtos do Mercado Livre e da Amazon Brasil, revise suas ofertas e organize publicações nos seus grupos de WhatsApp com o PromoFlow.",
};
export default function LandingPage() {
  return (
    <div className={`${unbounded.variable} flow-landing min-h-svh`}>
      <a
        href="#conteudo"
        className="bg-card focus:ring-primary sr-only z-50 rounded-md p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
      >
        Ir para o conteúdo
      </a>
      <header className="flow-nav sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="PromoFlow início" className="flow-brand">
            Promo<span>Flow</span>
          </Link>
          <nav
            aria-label="Navegação principal"
            className="order-3 flex w-full justify-center gap-6 text-xs sm:order-0 sm:w-auto sm:text-sm"
          >
            <a
              href="#como-funciona"
              className="text-muted-foreground hover:text-foreground"
            >
              Como funciona
            </a>
            <a
              href="#painel"
              className="text-muted-foreground hover:text-foreground"
            >
              O painel
            </a>
            <a
              href="#recursos"
              className="text-muted-foreground hover:text-foreground"
            >
              Recursos
            </a>
            <a
              href="#duvidas"
              className="text-muted-foreground hover:text-foreground"
            >
              Dúvidas
            </a>
          </nav>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/login">
              Entrar
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </header>
      <main id="conteudo">
        <Hero />
        <DashboardPreview />
        <Features />
        <Started />
      </main>
      <Footer />
      <MascotGuide />
    </div>
  );
}
