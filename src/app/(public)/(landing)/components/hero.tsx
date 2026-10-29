import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  Clock3,
  Headphones,
  MessageCircle,
  MoreHorizontal,
  Puzzle,
  Radio,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="from-primary/10 via-background to-background absolute inset-0 bg-linear-to-br" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div>
          <Badge
            variant="outline"
            className="bg-card mb-7 h-auto gap-2 px-3 py-2"
          >
            <span className="bg-success size-2 rounded-full" />
            Para quem compartilha boas ofertas
          </Badge>
          <h1 className="text-5xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
            Menos copiar e colar.
            <br />
            <span className="text-primary">Mais ofertas no ar.</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed">
            Do produto no navegador à mensagem no WhatsApp. Importe os dados,
            coloque seu link de afiliado e organize os envios em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link href="/login">
                Acessar o PromoFlow
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full px-6"
            >
              <a href="#como-funciona">
                Conhecer o fluxo
                <ArrowDown />
              </a>
            </Button>
          </div>
          <div className="text-muted-foreground mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              Mercado Livre
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              Amazon Brasil
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5" />
              WhatsApp
            </span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="bg-primary/15 absolute -inset-5 rounded-full blur-3xl" />
          <div className="bg-card relative overflow-hidden rounded-3xl border shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Radio className="text-primary size-4" />
                Seu fluxo de ofertas
              </span>
              <Badge variant="secondary">Demonstração</Badge>
            </div>
            <div className="space-y-4 p-5 sm:p-7">
              <div className="bg-muted/60 flex items-center gap-3 rounded-xl border p-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Puzzle className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Produto capturado</p>
                  <p className="text-muted-foreground text-xs">
                    Dados prontos para você revisar
                  </p>
                </div>
                <Check className="text-success size-4" />
              </div>
              <div className="text-muted-foreground flex justify-center">
                <ArrowDown className="size-4" />
              </div>
              <div className="bg-success/5 rounded-2xl border p-4">
                <div className="mb-4 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <MessageCircle className="text-success size-4" />
                    Seu grupo de ofertas
                  </span>
                  <MoreHorizontal className="size-4" />
                </div>
                <div className="bg-card ml-3 overflow-hidden rounded-2xl rounded-tl-sm border shadow-sm">
                  <div className="from-primary/10 to-muted flex h-36 items-center justify-center bg-linear-to-br">
                    <Headphones className="text-primary size-24 stroke-1" />
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-sm font-semibold">
                      Fone Bluetooth sem fio
                    </p>
                    <p className="text-muted-foreground text-xs">
                      De: <s>R$ 199,90</s>
                    </p>
                    <p className="text-lg font-semibold">
                      Por: R$ 149,90{" "}
                      <span className="text-success text-xs">−25%</span>
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Tag className="size-3" />
                      Cupom: SOM10
                    </p>
                    <p className="text-success text-xs underline">
                      Seu link de afiliado
                    </p>
                    <div className="text-muted-foreground flex justify-end gap-1 text-[10px]">
                      Mensagem de exemplo
                      <CheckCheck className="size-3" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock3 className="size-3.5" />
                  Você organiza. O publicador envia.
                </span>
                <span className="text-success flex items-center gap-1">
                  <Check className="size-3" />
                  Tudo no seu painel
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
