import {
  ArrowRight,
  CalendarClock,
  CheckCheck,
  Image,
  ListOrdered,
  Monitor,
  Puzzle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const steps = [
  {
    icon: Puzzle,
    title: "Encontrou? Capture.",
    text: "Abra o produto no Mercado Livre ou na Amazon Brasil e use a extensão para trazer os dados disponíveis.",
  },
  {
    icon: Image,
    title: "Dê o seu toque.",
    text: "Escolha a imagem, confira os preços e adicione seu link de afiliado e cupom. Você revisa antes de salvar.",
  },
  {
    icon: CalendarClock,
    title: "Escolha o destino.",
    text: "Selecione um grupo favorito e agende a oferta. A fila organiza o horário previsto de cada publicação.",
  },
  {
    icon: CheckCheck,
    title: "Acompanhe o resultado.",
    text: "Veja o status dos envios no painel e republique uma oferta quando fizer sentido para o seu grupo.",
  },
];
const features = [
  {
    icon: Puzzle,
    title: "Do navegador para o cadastro",
    text: "Menos campos para preencher à mão com a captura pela extensão do Chrome.",
  },
  {
    icon: Users,
    title: "Seus grupos à mão",
    text: "Favorite os destinos que você usa e mantenha os grupos vinculados à conta de WhatsApp conectada.",
  },
  {
    icon: ListOrdered,
    title: "Uma fila que você acompanha",
    text: "Consulte o horário previsto, o resultado e as observações de cada oferta em uma só tabela.",
  },
  {
    icon: Image,
    title: "Uma mensagem bem apresentada",
    text: "Imagem, preço atual, preço original, desconto e cupom quando disponíveis, junto do seu link.",
  },
  {
    icon: ShieldCheck,
    title: "Revisão antes da publicação",
    text: "Confira o rascunho e evite cadastrar o mesmo produto novamente no mesmo grupo.",
  },
  {
    icon: Monitor,
    title: "Conexão à vista",
    text: "Acompanhe o WhatsApp e o status do publicador local no painel de controle.",
  },
];
export function Features() {
  return (
    <>
      <section
        id="como-funciona"
        className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20 lg:py-24"
      >
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          Da descoberta ao grupo
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          A boa oferta você encontra.
          <br />O caminho até o grupo fica mais simples.
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title}>
              <div className="mb-5 flex items-center justify-between border-b pb-4">
                <Icon className="text-primary size-6" />
                <span className="text-muted-foreground text-sm">0{i + 1}</span>
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="recursos" className="bg-muted/40 scroll-mt-20 border-y">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                Mais organização, menos repetição
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Seu trabalho, em um só fluxo.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Da primeira captura ao histórico de envios, cada etapa tem o seu
              lugar.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="shadow-none">
                <CardHeader>
                  <Icon className="text-primary mb-4 size-6" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm leading-relaxed">
                  {text}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Extensão para Chrome
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Viu um produto bom?
            <br />
            Leve para o PromoFlow.
          </h2>
        </div>
        <div>
          <p className="text-muted-foreground leading-relaxed">
            Capture os dados da página que você já está vendo. A extensão abre
            um rascunho para conferir imagens, preços e detalhes antes de
            colocar a oferta na fila.
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-full">
            <Link href="/extension">
              Ver instalação da extensão
              <ArrowRight />
            </Link>
          </Button>
          <p className="text-muted-foreground mt-3 text-xs">
            Instalação manual no Chrome para computador. Faça login para baixar.
          </p>
        </div>
      </section>
    </>
  );
}
