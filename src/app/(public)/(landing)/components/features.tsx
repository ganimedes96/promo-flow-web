import {
  ArrowRight,
  Headphones,
  CalendarClock,
  CheckCheck,
  Image,
  ListOrdered,
  Monitor,
  Puzzle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ResourcePreview } from "./resource-preview";
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
      <section id="como-funciona" className="flow-journey-section">
        <div className="flow-journey-orbit" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="flow-journey-heading">
            <div>
              <p className="flow-journey-eyebrow">DA DESCOBERTA AO GRUPO</p>
              <h2 className="mt-4 max-w-2xl text-3xl text-balance sm:text-4xl">
                A boa oferta você encontra.
                <br />
                <span>O resto ganha flow.</span>
              </h2>
            </div>
            <p className="flow-journey-description">
              Quatro passos para transformar um bom achado na próxima oferta do
              seu grupo.
            </p>
          </div>
          <div className="flow-journey-track">
            <span>UM ACHADO</span>
            <div aria-hidden="true">
              <i />
            </div>
            <span>VÁRIAS POSSIBILIDADES ↗</span>
          </div>
          <div className="flow-journey-steps">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="flow-journey-step"
                style={{ animationDelay: `${i * 3}s` }}
              >
                <div className="flow-journey-step-top">
                  <span className="flow-journey-icon">
                    <Icon />
                  </span>
                  <span className="flow-journey-number">0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="flow-journey-progress" aria-hidden="true">
                  <i style={{ animationDelay: `${i * 3}s` }} />
                </div>
                <span className="flow-journey-step-tag">
                  {["CAPTURA", "SEU TOQUE", "DESTINO", "NO AR"][i]}
                  <span aria-hidden="true">↗</span>
                </span>
              </div>
            ))}
          </div>
          <p className="flow-journey-footnote">
            <span aria-hidden="true">✳</span>Você escolhe a oferta. Você confere
            os detalhes. O fluxo cuida do caminho.
          </p>
        </div>
      </section>
      <section id="recursos" className="flow-resources-section">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="flow-resources-heading">
            <div>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                MENOS ABAS. MAIS POSSIBILIDADES.
              </p>
              <h2 className="mt-4 max-w-xl text-3xl sm:text-4xl">
                Seu trabalho,
                <br />
                <span>em um só fluxo.</span>
              </h2>
            </div>
            <p>
              As ferramentas certas para cada etapa. Da captura ao histórico,
              sem perder o fio da oferta.
            </p>
          </div>
          <div className="flow-resources-grid">
            {features.map(({ icon: Icon, title, text }, index) => (
              <article
                className={`flow-resource-card flow-resource-card-${index}`}
                key={title}
              >
                <div className="flow-resource-card-top">
                  <span>
                    <Icon size={17} />
                  </span>
                  <b>0{index + 1} / RECURSO</b>
                  <span aria-hidden="true">↗</span>
                </div>
                <ResourcePreview index={index} />
                <div className="flow-resource-card-copy">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="flow-resource-bottom-line">
            <span>CAPTURAR</span>
            <i />
            <span>ORGANIZAR</span>
            <i />
            <span>COMPARTILHAR</span>
          </div>
        </div>
      </section>
      <section id="extensao" className="flow-extension-section">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-24">
          <div className="flow-extension-copy">
            <span className="flow-extension-label">
              <Puzzle size={14} />
              UMA EXTENSÃO. MENOS REPETIÇÃO.
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl">
              Achou na loja?
              <br />
              <span>Traga para o flow.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed">
              Capture os dados da página que você já está vendo. A extensão abre
              um rascunho para conferir imagens, preços e detalhes antes de
              colocar a oferta na fila.
            </p>
            <Button asChild size="lg" className="flow-extension-button mt-7">
              <Link href="/extension">
                Ver instalação da extensão
                <ArrowRight />
              </Link>
            </Button>
            <small>
              Instalação manual no Chrome para computador. Faça login para
              baixar.
            </small>
            <div className="flow-extension-shortcut">
              <span>UM ATALHO PARA SEU ACHADO</span>
              <div>
                <kbd>Alt</kbd>
                <b>+</b>
                <kbd>Shift</kbd>
                <b>+</b>
                <kbd>P</kbd>
              </div>
            </div>
          </div>
          <div className="flow-extension-stage" aria-hidden="true">
            <span className="flow-extension-orbit" />
            <div className="flow-extension-browser">
              <div className="flow-extension-browser-bar">
                <span>● ● ●</span>
                <span>loja / produto</span>
                <Puzzle size={15} />
              </div>
              <div className="flow-extension-product">
                <span>
                  <Headphones size={74} strokeWidth={1.2} />
                </span>
                <div>
                  <i />
                  <i />
                  <strong>R$ 149,90</strong>
                  <small>Um bom achado</small>
                </div>
              </div>
              <div className="flow-extension-popup">
                <div>
                  <Puzzle size={19} />
                  <strong>PromoFlow</strong>
                  <span>↗</span>
                </div>
                <p>Seu achado está pronto.</p>
                <span className="flow-extension-popup-button">
                  Capturar e abrir no PromoFlow ↗
                </span>
                <div className="flow-extension-checks">
                  {["Título", "Imagens", "Preços"].map((label) => (
                    <span key={label}>
                      <CheckCheck size={11} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="flow-extension-stamp">
              MENOS CTRL+C
              <br />
              MAIS FLOW ↗
            </span>
            <span className="flow-extension-note">
              PRÉVIA ILUSTRATIVA DA CAPTURA
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
