export interface ConversionRetryFeedback {
  ok: boolean;
  message: string;
}
export function requestMirrorConversion(
  offerId: string,
  accountId?: string
): Promise<ConversionRetryFeedback> {
  if (!accountId)
    return Promise.resolve({
      ok: false,
      message: "Sua sessão expirou. Entre novamente para converter.",
    });
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const finish = (feedback: ConversionRetryFeedback) => {
      clearTimeout(timer);
      window.removeEventListener("message", receive);
      resolve(feedback);
    };
    const receive = (event: MessageEvent<unknown>) => {
      if (
        event.source !== window ||
        event.origin !== location.origin ||
        !event.data ||
        typeof event.data !== "object"
      )
        return;
      const data = event.data;
      if (
        !("type" in data) ||
        data.type !== "PROMOFLOW_CONVERSION_RETRY_RESULT" ||
        !("requestId" in data) ||
        data.requestId !== requestId ||
        !("accountId" in data) ||
        data.accountId !== accountId
      )
        return;
      if (!("ok" in data) || data.ok !== true) {
        finish({
          ok: false,
          message:
            "error" in data && typeof data.error === "string"
              ? data.error
              : "A extensão não confirmou a nova tentativa.",
        });
        return;
      }
      const state = "state" in data ? data.state : null;
      finish({
        ok: true,
        message:
          state === "CONVERTING"
            ? "A extensão iniciou a conversão desta oferta. O resultado será atualizado aqui."
            : state === "BUSY"
              ? "Há outra conversão aberta na extensão. Esta oferta recebeu prioridade para quando ela for encerrada."
              : "Oferta priorizada. Aguardando a extensão ou a liberação da conversão atual.",
      });
    };
    window.addEventListener("message", receive);
    const timer = setTimeout(
      () =>
        finish({
          ok: false,
          message:
            "A extensão não respondeu. Recarregue a extensão no Chrome e esta página, confira a conta e o ambiente conectados e tente novamente. A oferta permanece salva na fila.",
        }),
      15000
    );
    window.postMessage(
      { type: "PROMOFLOW_CONVERSION_RETRY", requestId, accountId, offerId },
      location.origin
    );
  });
}
