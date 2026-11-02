export const featureCategories = [
  {
    title: "Encontrar achados",
    description: "Mais caminhos para a sua próxima boa oferta.",
    points: [
      "Central de promoções",
      "Captura pela extensão",
      "Grupos que você acompanha",
    ],
  },
  {
    title: "Deixar com sua cara",
    description: "Seu link, sua mensagem e cada detalhe no lugar.",
    points: [
      "Conversão de afiliados",
      "Mensagem personalizada",
      "Imagem e marca d’água",
    ],
  },
  {
    title: "Colocar no fluxo",
    description: "Escolha os destinos e acompanhe cada publicação.",
    points: [
      "Contas e grupos favoritos",
      "Agendamento por destino",
      "Histórico de envios",
    ],
  },
] as const;
export const featureSlides = [
  {
    category: 0,
    kind: "catalog",
    eyebrow: "CENTRAL DE PROMOÇÕES",
    title: "Seu próximo achado pode estar pronto.",
    text: "Explore novidades, filtre por categoria e escolha os produtos que combinam com seus grupos. Prepare sua oferta a partir do que encontrou.",
    tags: ["Novidades em destaque", "Categorias"],
  },
  {
    category: 0,
    kind: "capture",
    eyebrow: "EXTENSÃO DO CHROME",
    title: "Encontrou na loja? Traga para cá.",
    text: "Capture título, imagem e preços disponíveis no Mercado Livre, Shopee e Amazon Brasil. Revise os dados antes de cadastrar.",
    tags: ["Menos digitação", "Revisão antes de salvar"],
  },
  {
    category: 0,
    kind: "mirror",
    eyebrow: "GRUPOS ESPELHADOS",
    title: "Acompanhe de onde vêm seus achados.",
    text: "Escolha até três origens entre WhatsApp e Telegram. Novas promoções viram ofertas privadas para você preparar, sem destino nem envio automático.",
    tags: ["WhatsApp + Telegram", "Rascunhos privados"],
  },
  {
    category: 1,
    kind: "affiliate",
    eyebrow: "SEU LINK DE AFILIADO",
    title: "O produto é um achado. O link é seu.",
    text: "A extensão usa o gerador oficial da sua conta do Mercado Livre ou Shopee para preencher seu link. Acompanhe a conversão e confira o resultado.",
    tags: ["Mercado Livre e Shopee", "Chrome conectado à loja"],
  },
  {
    category: 1,
    kind: "message",
    eyebrow: "MINHAS MENSAGENS",
    title: "Escreva do seu jeito.",
    text: "Escolha quais informações aparecem na mensagem e personalize a chamada de cada oferta. Preço original, desconto e cupom entram quando disponíveis.",
    tags: ["Padrão da sua conta", "Chamada por oferta"],
  },
  {
    category: 1,
    kind: "watermark",
    eyebrow: "IMAGEM E IDENTIDADE",
    title: "Um toque seu em cada imagem.",
    text: "Configure sua marca d’água e escolha entre imagem do produto ou prévia do link. A exibição da prévia depende da loja e do WhatsApp.",
    tags: ["Sua marca d’água", "Imagem ou prévia"],
  },
  {
    category: 2,
    kind: "groups",
    eyebrow: "CONTAS E DESTINOS",
    title: "Os grupos certos, sempre à mão.",
    text: "Organize suas contas do WhatsApp, favorite os grupos e selecione vários destinos. Cada publicação fica vinculada à conexão responsável.",
    tags: ["Várias conexões", "Grupos favoritos"],
  },
  {
    category: 2,
    kind: "queue",
    eyebrow: "FILA E AGENDAMENTO",
    title: "Cada oferta no seu momento.",
    text: "Revise, escolha os destinos e agende. Veja o horário previsto e os motivos que podem pausar a fila antes do envio.",
    tags: ["Horário por destino", "Você acompanha a fila"],
  },
  {
    category: 2,
    kind: "history",
    eyebrow: "RESULTADOS À VISTA",
    title: "Saiba o que aconteceu depois.",
    text: "Consulte o resultado das publicações, identifique falhas e confira tentativas sem confirmação. Republique um bom achado quando fizer sentido.",
    tags: ["Histórico de envios", "Republicação"],
  },
] as const;
export type FeatureKind = (typeof featureSlides)[number]["kind"];
