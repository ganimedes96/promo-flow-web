import { ArrowRight, Plus, Sparkles, MessageCircle } from "lucide-react";
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
      <section id="duvidas" className="flow-faq-section">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[.85fr_1.15fr] lg:py-24">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              PODE PERGUNTAR.
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl">
              Antes do primeiro
              <br />
              <span>bom achado.</span>
            </h2>
            <p className="flow-faq-description">
              Tudo o que você precisa saber para entrar no fluxo com
              tranquilidade.
            </p>
            <div className="flow-faq-art" aria-hidden="true">
              <span>?</span>
              <MessageCircle />
              <i>!</i>
              <b>BOA PERGUNTA ↗</b>
            </div>
          </div>
          <div className="flow-faq-list">
            {questions.map(({ question, answer }, index) => (
              <details key={question}>
                <summary>
                  <span className="flow-faq-number">0{index + 1}</span>
                  <span>{question}</span>
                  <Plus size={17} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section id="comecar" className="flow-final-section">
        <div className="flow-final-orbits" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="flow-final-stickers" aria-hidden="true">
          <span>SEU PRÓXIMO ACHADO ↗</span>
          <span>DESTINO: SEUS GRUPOS</span>
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
          <span className="flow-final-eyebrow">
            <Sparkles size={15} />
            ENCONTRE. PREPARE. COMPARTILHE.
          </span>
          <h2 className="mt-6 text-4xl text-balance sm:text-5xl">
            A próxima boa oferta
            <br />
            <em>começa com você.</em>
          </h2>
          <p>
            Entre no PromoFlow, conecte seu WhatsApp e dê mais fluidez à sua
            rotina de publicações.
          </p>
          <Button asChild size="lg" className="flow-final-button">
            <Link href="/login">
              Entrar no fluxo
              <ArrowRight />
            </Link>
          </Button>
          <span className="flow-final-caption">
            Você no controle. Seus achados em movimento.
          </span>
        </div>
      </section>
    </>
  );
}
