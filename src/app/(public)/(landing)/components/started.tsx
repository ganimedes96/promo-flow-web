import { ArrowRight, Plus, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const questions = [
  {
    question: "Preciso deixar o computador ligado?",
    answer:
      "Sim. Nesta versão, o publicador e o coletor precisam estar em execução no computador para enviar e capturar ofertas, respectivamente. O site permite organizar e acompanhar tudo. A conversão de links do Mercado Livre acontece no Chrome.",
  },
  {
    question: "A extensão publica assim que eu capturo?",
    answer:
      "Não. Ela abre um rascunho com os dados disponíveis na página. Você confere, escolhe o grupo e salva a oferta antes de agendar a publicação.",
  },
  {
    question: "Quais lojas funcionam com a extensão?",
    answer:
      "Mercado Livre, Amazon Brasil e Shopee. Os campos capturados dependem das informações exibidas em cada página. Confira variação, preço, frete e condições de cupom antes de salvar.",
  },
  {
    question: "Meu link de afiliado é criado automaticamente?",
    answer:
      "No Mercado Livre, a extensão usa o gerador oficial no seu Chrome, com sua conta de afiliado conectada. Ao preparar uma oferta da Central, ela pode iniciar essa conversão e preencher o resultado. Para outras lojas, informe seu próprio link. Confira sempre o link antes de salvar.",
  },
  {
    question: "De onde vêm as ofertas da Central?",
    answer:
      "A Central reúne promoções selecionadas para você explorar. Escolha um produto, confira preço e condições e prepare sua própria oferta, com seu link de afiliado e seus grupos. Você decide o que salvar e quando agendar.",
  },
  {
    question: "Posso conectar mais de uma conta de WhatsApp?",
    answer:
      "Sim. Na página Conexões, gerencie suas contas. Os grupos ficam vinculados ao número correspondente, e você escolhe os favoritos que receberão cada oferta. Os envios são acompanhados por destino.",
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
