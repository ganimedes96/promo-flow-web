import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const questions = [
  {
    question: "Preciso deixar o computador ligado?",
    answer:
      "Sim. Nesta versão, os envios dependem do publicador local em execução, com acesso à internet e o WhatsApp conectado. O site permite organizar e acompanhar suas ofertas.",
  },
  {
    question: "A extensão publica assim que eu capturo?",
    answer:
      "Não. Ela abre um rascunho com os dados disponíveis na página. Você confere, escolhe o grupo e salva a oferta antes de agendar a publicação.",
  },
  {
    question: "Quais lojas funcionam com a extensão?",
    answer:
      "Mercado Livre e Amazon Brasil. Os campos capturados dependem das informações exibidas em cada página. Confira variação, preço, frete e condições de cupom antes de salvar.",
  },
  {
    question: "Meu link de afiliado é criado automaticamente?",
    answer:
      "Você informa o seu próprio link de afiliado no cadastro da oferta. Ele é usado na mensagem publicada no WhatsApp.",
  },
  {
    question: "Posso publicar uma oferta de novo?",
    answer:
      "Sim. A ação de republicar permite colocar uma oferta publicada novamente na fila. Você acompanha os horários e os resultados na tela de ofertas.",
  },
];
export function Started() {
  return (
    <>
      <section id="duvidas" className="bg-muted/40 scroll-mt-20 border-y">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              Sem complicação
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Antes de começar,
              <br />
              tire suas dúvidas.
            </h2>
          </div>
          <div className="divide-y">
            {questions.map(({ question, answer }) => (
              <details key={question} className="group py-5 first:pt-0">
                <summary className="marker:text-primary cursor-pointer text-sm font-medium">
                  {question}
                </summary>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="bg-primary/10 rounded-3xl border p-8 text-center sm:p-14">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Seu próximo achado já tem destino
          </p>
          <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Dê mais fluidez à sua rotina de ofertas.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg">
            Entre no PromoFlow, conecte seu WhatsApp e prepare sua próxima
            publicação.
          </p>
          <Button asChild size="lg" className="mt-7 h-12 rounded-full px-7">
            <Link href="/login">
              Acessar minha conta
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
