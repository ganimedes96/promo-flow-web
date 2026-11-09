export enum OfferStatus {
  PROCESSING = "PROCESSING",
  READY = "READY",
  SCHEDULED = "SCHEDULED",
  PUBLISHING = "PUBLISHING",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum OfferWaitReason {
  PAUSED = "PAUSED",
  WAITING_CONNECTION = "WAITING_CONNECTION",
  GROUP_UNAVAILABLE = "GROUP_UNAVAILABLE",
  AUTOMATION_RULES = "AUTOMATION_RULES",
  AUTOMATION_WINDOW = "AUTOMATION_WINDOW",
  AUTOMATION_DAILY_LIMIT = "AUTOMATION_DAILY_LIMIT",
  WORKER_OFFLINE = "WORKER_OFFLINE",
  PUBLISHING_DISABLED = "PUBLISHING_DISABLED",
  PREVIOUS_UNCONFIRMED = "PREVIOUS_UNCONFIRMED",
  PREVIOUS_SENDING = "PREVIOUS_SENDING",
  AFFILIATE = "AFFILIATE",
}

export enum OfferPreparationStatus {
  WAITING_AFFILIATE_LINK = "WAITING_AFFILIATE_LINK",
  CONVERTING_LINK = "CONVERTING_LINK",
  RECONNECT_STORE = "RECONNECT_STORE",
  REVIEW_CONVERSION = "REVIEW_CONVERSION",
  STORE_REQUIRED = "STORE_REQUIRED",
  WAITING_EXTENSION = "WAITING_EXTENSION",
  DESTINATION_REQUIRED = "DESTINATION_REQUIRED",
  SEND_UNCONFIRMED = "SEND_UNCONFIRMED",
}

export const OFFER_STATUS_INFO: Record<OfferStatus, { label: string; help: string }> = {
  [OfferStatus.PROCESSING]: { label: "Processando", help: "A oferta está sendo preparada para entrar na fila." },
  [OfferStatus.READY]: { label: "Pronta", help: "A oferta pode ser agendada ou enviada manualmente." },
  [OfferStatus.SCHEDULED]: { label: "Agendada", help: "A oferta está na fila e será enviada no horário previsto, quando as condições estiverem liberadas." },
  [OfferStatus.PUBLISHING]: { label: "Enviando", help: "O worker está tentando publicar a oferta no destino." },
  [OfferStatus.PUBLISHED]: { label: "Publicada", help: "O envio foi confirmado pelo serviço de publicação." },
  [OfferStatus.FAILED]: { label: "Falhou", help: "O envio falhou. Confira os detalhes antes de tentar novamente." },
  [OfferStatus.CANCELLED]: { label: "Cancelada", help: "O envio foi removido da fila. Você pode agendá-lo novamente." },
};

export const OFFER_WAIT_REASON_INFO: Record<OfferWaitReason, { label: string; help: string }> = {
  [OfferWaitReason.PAUSED]: { label: "Conexão pausada", help: "Retome a conexão para liberar a fila." },
  [OfferWaitReason.WAITING_CONNECTION]: { label: "Aguardando conexão", help: "Conecte o serviço de destino para continuar." },
  [OfferWaitReason.GROUP_UNAVAILABLE]: { label: "Grupo indisponível", help: "Confira se o grupo ainda está disponível nessa conexão." },
  [OfferWaitReason.AUTOMATION_RULES]: { label: "Revisar automação", help: "A oferta não atende às regras de automação configuradas." },
  [OfferWaitReason.AUTOMATION_WINDOW]: { label: "Fora do horário", help: "O envio aguarda a próxima janela permitida." },
  [OfferWaitReason.AUTOMATION_DAILY_LIMIT]: { label: "Limite diário atingido", help: "A fila continua quando houver cota diária disponível." },
  [OfferWaitReason.WORKER_OFFLINE]: { label: "Publicador offline", help: "Inicie o worker para retomar os envios." },
  [OfferWaitReason.PUBLISHING_DISABLED]: { label: "Envios desativados", help: "Ative novamente a publicação na conexão." },
  [OfferWaitReason.PREVIOUS_UNCONFIRMED]: { label: "Aguardando conferência", help: "Uma oferta anterior deste grupo pode ter sido enviada. Confira o resultado dela antes de liberar a fila." },
  [OfferWaitReason.PREVIOUS_SENDING]: { label: "Aguardando envio anterior", help: "A fila libera o próximo envio depois que o anterior terminar." },
  [OfferWaitReason.AFFILIATE]: { label: "Aguardando link de afiliado", help: "Conclua a conversão do link antes de preparar o envio." },
};

export const OFFER_PREPARATION_STATUS_INFO: Record<OfferPreparationStatus, { label: string; help: string }> = {
  [OfferPreparationStatus.WAITING_AFFILIATE_LINK]: { label: "Aguardando seu link", help: "Informe ou gere seu link de afiliado antes de escolher o destino." },
  [OfferPreparationStatus.CONVERTING_LINK]: { label: "Convertendo link", help: "A extensão está preparando o link de afiliado." },
  [OfferPreparationStatus.RECONNECT_STORE]: { label: "Faça login na loja", help: "Entre na sua conta de afiliado no mesmo Chrome em que usa a extensão. Depois, tente converter o link novamente." },
  [OfferPreparationStatus.REVIEW_CONVERSION]: { label: "Revisar conversão", help: "A conversão do link falhou. Confira o endereço e tente novamente." },
  [OfferPreparationStatus.STORE_REQUIRED]: { label: "Configurar loja", help: "Cadastre a configuração da loja na página Lojas para converter o link." },
  [OfferPreparationStatus.WAITING_EXTENSION]: { label: "Aguardando extensão", help: "Abra o Chrome com a extensão conectada para processar o link." },
  [OfferPreparationStatus.DESTINATION_REQUIRED]: { label: "Escolher destino", help: "Selecione um ou mais grupos para enviar esta oferta." },
  [OfferPreparationStatus.SEND_UNCONFIRMED]: { label: "Sem confirmação", help: "O resultado do envio não foi confirmado. Confira o grupo antes de reenviar." },
};
