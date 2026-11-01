import {
  ArrowRight,
  Link2,
  Radio,
  Sparkles,
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
    text: "Capture produtos do Mercado Livre, Amazon Brasil e Shopee pela extensão ou escolha um achado na Central de promoções.",
  },
  {
    icon: Image,
    title: "Dê o seu toque.",
    text: "Confira imagem, preços e cupom. No Mercado Livre, use a extensão para gerar seu link de afiliado antes de salvar.",
  },
  {
    icon: CalendarClock,
    title: "Escolha o destino.",
    text: "Escolha uma ou mais contas e seus grupos favoritos. Agende a oferta e acompanhe o horário previsto de cada destino.",
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
    text: "Gerencie várias contas de WhatsApp, favorite seus grupos e escolha os destinos sem misturar as conexões.",
  },
  {
    icon: ListOrdered,
    title: "Uma fila que você acompanha",
    text: "Filtre por período, conta, grupo e status. Veja os destinos de cada oferta e republique quando quiser.",
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
      <section id="novidades" className="flow-updates-section">
        <div className="flow-updates-art" aria-hidden="true">
          <span />
          <span />
          <span />
          <i>✳</i>
          <i>↗</i>
          <i>✦</i>
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <p className="flow-journey-eyebrow">
            MAIS CAMINHOS PARA O SEU PRÓXIMO ACHADO
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">
            Encontre. Adapte. Coloque no fluxo.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed">
            Além de capturar nas lojas, descubra produtos na Central e prepare
            ofertas com a sua identidade e os seus destinos.
          </p>
          <div className="flow-updates-grid">
            {[
              {
                icon: Sparkles,
                label: "CENTRAL DE PROMOÇÕES",
                title: "Seu próximo achado já pode estar aqui.",
                text: "Veja as novidades em destaque, encontre produtos por categoria e prepare sua própria oferta a partir da Central.",
                stages: [
                  "Novidades",
                  "Escolher produto",
                  "Preparar minha oferta",
                ],
              },
              {
                icon: Radio,
                label: "DESCOBERTAS PARA VOCÊ",
                title: "Menos procura. Mais bons achados.",
                text: "Encontre promoções reunidas na Central, confira os detalhes e escolha o que combina com seus grupos. Depois, prepare a oferta do seu jeito.",
                stages: [
                  "Explorar a Central",
                  "Conferir os detalhes",
                  "Preparar sua oferta",
                ],
              },
              {
                icon: Link2,
                label: "SEU LINK DE AFILIADO",
                title: "Do achado ao seu link, com menos cliques.",
                text: "Ao preparar uma oferta do Mercado Livre na Central, a extensão pode abrir o gerador oficial e preencher o link gerado pela sua conta.",
                stages: [
                  "Mercado Livre",
                  "Gerador oficial",
                  "Seu link na oferta",
                ],
              },
            ].map(({ icon: Icon, label, title, text, stages }, index) => (
              <article key={label} className="flow-update-card">
                <span className="flow-update-label">
                  <Icon size={18} />
                  {label}
                </span>
                <div
                  className={`flow-update-demo flow-update-demo-${index}`}
                  aria-hidden="true"
                >
                  <div className="flow-update-demo-bar">
                    <span>● ● ●</span>
                    <b>
                      {
                        [
                          "CENTRAL / NOVIDADES",
                          "CENTRAL / DESCOBERTAS",
                          "AFILIADOS / CONVERSÃO",
                        ][index]
                      }
                    </b>
                  </div>
                  {index === 0 ? (
                    <div className="flow-update-products">
                      {[
                        "Fone Bluetooth",
                        "Achado para casa",
                        "Kit de camisetas",
                        "Fone Bluetooth",
                      ].map((product, item) => (
                        <div key={`${product}-${item}`}>
                          <Headphones size={22} />
                          <span>
                            <b>{product}</b>
                            <small>Pronto para preparar</small>
                          </span>
                          <em>NOVO</em>
                        </div>
                      ))}
                    </div>
                  ) : index === 1 ? (
                    <div className="flow-update-capture">
                      <span>Tecnologia</span>
                      <span>Casa e utilidades</span>
                      <div className="flow-update-signal">
                        <i />
                        <i />
                        <i />
                      </div>
                      <b>
                        <Radio size={20} /> Novo achado
                      </b>
                      <small>Confira e prepare sua oferta</small>
                    </div>
                  ) : (
                    <div className="flow-update-convert">
                      <span>
                        Produto encontrado <CheckCheck size={14} />
                      </span>
                      <div>
                        <Link2 size={25} />
                        <i />
                        <ArrowRight size={19} />
                        <i />
                        <CheckCheck size={25} />
                      </div>
                      <b>Seu link de afiliado</b>
                      <small>meli.la/seu-link</small>
                    </div>
                  )}
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <ol aria-label={`Etapas: ${label.toLowerCase()}`}>
                  {stages.map((stage) => (
                    <li key={stage}>
                      <CheckCheck size={14} />
                      {stage}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed">
            A conversão do Mercado Livre precisa da extensão instalada e da sua
            conta de afiliado conectada no Chrome. Você confere o resultado
            antes de salvar. Escolher um produto na Central não publica
            automaticamente nos grupos.
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
              Mercado Livre, Amazon Brasil e Shopee: capture os dados
              disponíveis na página, confira preços e imagens e prepare sua
              oferta. Entre na extensão com sua conta e use também a conversão
              de links do Mercado Livre pelo gerador oficial.
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
