"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStores } from "@/domains/stores/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Link2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { isMercadoLivreLink } from "@/domains/offers/affiliate-links";
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function abortConversion(requestId: string, accountId?: string) {
  if (accountId)
    window.postMessage(
      { type: "PROMOFLOW_AFFILIATE_ABORT", requestId, accountId },
      location.origin
    );
}
export function MercadoLivreAffiliate({
  sourceUrl,
  onReceive,
  autoConvertKey,
  affiliateUrl = "",
}: {
  sourceUrl: string;
  onReceive: (url: string) => void;
  autoConvertKey?: string;
  affiliateUrl?: string;
}) {
  const { data: session } = useSession();
  const accountId = session?.user.id;
  const stores = useQuery({
    queryKey: queryKeys.stores.list(accountId),
    queryFn: getStores,
    enabled: !!accountId && isMercadoLivreLink(sourceUrl),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const store = stores.data?.find(
    (item) => item.marketplace === "MERCADO_LIVRE"
  );
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{
    url: string;
    text: string;
    pending: boolean;
    error: boolean;
    converted?: boolean;
    appliedUrl?: string;
  } | null>(null);
  const receiveRef = useRef(onReceive);
  const affiliateRef = useRef(affiliateUrl);
  useEffect(() => {
    receiveRef.current = onReceive;
  }, [onReceive]);
  useEffect(() => {
    affiliateRef.current = affiliateUrl;
  }, [affiliateUrl]);
  const pending = useRef<{
    id: string;
    url: string;
    initialAffiliate: string;
  } | null>(null);
  const automaticAttempt = useRef<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent<unknown>) => {
      if (
        event.source !== window ||
        event.origin !== location.origin ||
        !record(event.data)
      )
        return;
      const data = event.data;
      if (
        data.type === "PROMOFLOW_EXTENSION_READY" &&
        data.feature === "mercado-affiliate-v5"
      ) {
        setInstalled(true);
        return;
      }
      if (
        !pending.current ||
        data.requestId !== pending.current.id ||
        pending.current.url !== sourceUrl
      )
        return;
      if (data.type === "PROMOFLOW_AFFILIATE_OPENED") {
        if (data.ok !== true) {
          pending.current = null;
          if (timeout.current) clearTimeout(timeout.current);
        }
        setFeedback({
          url: sourceUrl,
          text:
            data.ok === true
              ? "A extensão está identificando o produto e usando o gerador oficial da sua conta."
              : typeof data.error === "string"
                ? data.error
                : "Não foi possível abrir a loja.",
          pending: data.ok === true,
          error: data.ok !== true,
        });
      }
      if (
        data.type === "PROMOFLOW_AFFILIATE_PROGRESS" &&
        data.accountId === accountId &&
        typeof data.text === "string"
      ) {
        if (timeout.current) clearTimeout(timeout.current);
        if (data.status !== "error") {
          const requestId = pending.current?.id;
          timeout.current = setTimeout(() => {
            if (!requestId || pending.current?.id !== requestId) return;
            abortConversion(requestId, accountId);
            pending.current = null;
            setFeedback({
              url: sourceUrl,
              text: "A conversão demorou mais que o esperado. Seus campos foram preservados; tente novamente.",
              pending: false,
              error: true,
            });
          }, 180000);
        }
        setFeedback({
          url: sourceUrl,
          text: data.text,
          pending: data.status !== "error",
          error: data.status === "error",
        });
      }
      if (
        data.type === "PROMOFLOW_AFFILIATE_RESULT" &&
        pending.current &&
        data.accountId === accountId &&
        isMercadoLivreLink(data.affiliateUrl)
      ) {
        if (
          affiliateRef.current.trim() !==
          pending.current.initialAffiliate.trim()
        ) {
          pending.current = null;
          if (timeout.current) clearTimeout(timeout.current);
          setFeedback({
            url: sourceUrl,
            text: "Você alterou o link durante a conversão. Mantivemos o link que você informou.",
            pending: false,
            error: false,
          });
          return;
        }
        receiveRef.current(data.affiliateUrl);
        if (data.mode === "automatic")
          toast.success("Link de afiliado aplicado com sucesso!");
        pending.current = null;
        if (timeout.current) clearTimeout(timeout.current);
        setFeedback({
          url: sourceUrl,
          text:
            data.mode === "automatic"
              ? "Link gerado no Mercado Livre e preenchido na sua oferta. Confira antes de salvar."
              : "Link manual recebido da loja. Confira se foi gerado pela sua conta antes de salvar.",
          pending: false,
          error: false,
          converted: data.mode === "automatic",
          appliedUrl: data.affiliateUrl,
        });
      }
    };
    window.addEventListener("message", receive);
    window.postMessage({ type: "PROMOFLOW_EXTENSION_HELLO" }, location.origin);
    const detector = setTimeout(
      () => setInstalled((previous) => (previous === true ? true : false)),
      1500
    );
    return () => {
      window.removeEventListener("message", receive);
      clearTimeout(detector);
      if (timeout.current) clearTimeout(timeout.current);
      if (pending.current) abortConversion(pending.current.id, accountId);
      pending.current = null;
    };
  }, [accountId, sourceUrl]);
  const begin = useCallback(() => {
    if (
      !accountId ||
      !store ||
      !isMercadoLivreLink(sourceUrl) ||
      pending.current
    )
      return;
    const id = crypto.randomUUID();
    pending.current = {
      id,
      url: sourceUrl,
      initialAffiliate: affiliateRef.current,
    };
    if (timeout.current) clearTimeout(timeout.current);
    setFeedback({
      url: sourceUrl,
      text: "Abrindo o Mercado Livre para converter o link pela sua conta. Seus campos e grupos ficam preservados.",
      pending: true,
      error: false,
    });
    window.postMessage(
      {
        type: "PROMOFLOW_AFFILIATE_BEGIN",
        requestId: id,
        accountId,
        productUrl: sourceUrl,
      },
      location.origin
    );
    timeout.current = setTimeout(() => {
      if (pending.current) abortConversion(pending.current.id, accountId);
      pending.current = null;
      setFeedback({
        url: sourceUrl,
        text: "A solicitação expirou. Você pode tentar novamente ou preencher seu link manualmente.",
        pending: false,
        error: true,
      });
    }, 180000);
  }, [accountId, sourceUrl, store]);
  useEffect(() => {
    if (
      !store ||
      !autoConvertKey ||
      !accountId ||
      installed !== true ||
      !isMercadoLivreLink(sourceUrl) ||
      affiliateUrl.trim()
    )
      return;
    const key = `${accountId}:${autoConvertKey}:${sourceUrl}`;
    if (automaticAttempt.current === key) return;
    // Defer until the message listener is attached; cleanup prevents duplicate launches in StrictMode.
    const launch = setTimeout(() => {
      if (automaticAttempt.current === key || pending.current) return;
      automaticAttempt.current = key;
      begin();
    }, 0);
    return () => clearTimeout(launch);
  }, [
    autoConvertKey,
    accountId,
    installed,
    sourceUrl,
    affiliateUrl,
    begin,
    store,
  ]);
  const cancel = () => {
    if (pending.current) abortConversion(pending.current.id, accountId);
    pending.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    setFeedback({
      url: sourceUrl,
      text: "Conversão cancelada. Seus campos foram preservados.",
      pending: false,
      error: true,
    });
  };
  const retry = () => {
    if (pending.current) abortConversion(pending.current.id, accountId);
    pending.current = null;
    begin();
  };
  if (!isMercadoLivreLink(sourceUrl)) return null;
  if (stores.isPending)
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-xs sm:col-span-2">
        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        Conferindo sua loja de afiliado…
      </p>
    );
  if (stores.isError)
    return (
      <div className="rounded-xl border p-4 text-xs sm:col-span-2">
        <p>Não foi possível consultar sua loja de afiliado.</p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => void stores.refetch()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  if (!store?.linkBuilderUrl)
    return (
      <div className="border-primary/25 bg-primary/5 space-y-2 rounded-xl border p-4 sm:col-span-2">
        <p className="text-sm font-semibold">
          Configure sua conta do Mercado Livre
        </p>
        <p className="text-muted-foreground text-xs">
          Cadastre seu perfil e sua etiqueta em Lojas para converter os links
          desta oferta. Os campos já preenchidos serão mantidos.
        </p>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/stores" target="_blank" rel="noopener noreferrer">
            Configurar loja
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  const current = feedback?.url === sourceUrl ? feedback : null;
  const status =
    current?.converted && current.appliedUrl !== affiliateUrl.trim()
      ? null
      : current;
  if (status?.converted && status.appliedUrl === affiliateUrl.trim()) {
    return (
      <div
        role="status"
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 flex items-start gap-3 rounded-xl border border-emerald-600/40 bg-emerald-500/10 p-4 text-emerald-900 sm:col-span-2 dark:text-emerald-200"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold">
            Link de afiliado aplicado com sucesso!
          </p>
          <p className="text-xs leading-relaxed">
            O link gerado no Mercado Livre foi preenchido nesta oferta. Confira
            os dados e salve quando estiver pronto.
          </p>
          <span
            className="block max-w-full truncate text-xs font-medium"
            title={status.appliedUrl}
          >
            {status.appliedUrl}
          </span>
        </div>
      </div>
    );
  }
  if (autoConvertKey && installed === true) {
    return (
      <div
        className="border-primary/20 bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:col-span-2"
        role={status?.error ? "alert" : "status"}
      >
        {status?.pending ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <Link2 className="size-4" />
        )}
        <span className="flex-1">
          {status?.error
            ? status.text
            : status?.pending
              ? "Preparando seu link de afiliado… Pode continuar preenchendo a oferta."
              : status?.converted
                ? "Seu link de afiliado está pronto."
                : affiliateUrl.trim()
                  ? "Link preenchido. Confira antes de salvar."
                  : "Preparando a conversão do seu link…"}
        </span>
        {status?.pending && (
          <Button type="button" size="sm" variant="ghost" onClick={cancel}>
            Cancelar
          </Button>
        )}
        {!status?.pending && (status?.error || !affiliateUrl.trim()) && (
          <Button type="button" size="sm" variant="ghost" onClick={retry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="border-primary/25 bg-primary/5 space-y-3 rounded-xl border p-4 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="size-4" /> Seu link do Mercado Livre
          </p>
          <p className="text-muted-foreground mt-1 max-w-xl text-xs">
            {autoConvertKey
              ? "Estamos preparando esta promoção com o seu link de afiliado. A extensão usa a conta do Mercado Livre aberta no seu Chrome e devolve o resultado a este formulário."
              : "A extensão abre o produto, usa o gerador oficial da conta aberta no seu Chrome e preenche seu link de afiliado. Os demais campos e grupos ficam preservados."}
          </p>
        </div>
        {installed ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={retry}
            disabled={!accountId || status?.pending}
          >
            {status?.pending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <ArrowUpRight className="size-4" />
            )}{" "}
            Converter meu link
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/extension" target="_blank" rel="noopener noreferrer">
              {installed === null
                ? "Verificando extensão…"
                : "Atualizar / instalar extensão"}
            </Link>
          </Button>
        )}
      </div>
      {status?.pending && (
        <Button type="button" size="sm" variant="ghost" onClick={cancel}>
          Cancelar conversão
        </Button>
      )}
      {status && (
        <Badge
          className={
            status.error
              ? "justify-center bg-rose-700 text-white"
              : status.pending
                ? "justify-center bg-blue-700 text-white"
                : "justify-center bg-emerald-700 text-white"
          }
        >
          {status.error
            ? "Não convertido"
            : status.pending
              ? "Convertendo…"
              : status.converted
                ? "Convertido"
                : "Link recebido"}
        </Badge>
      )}
      {status && (
        <p
          role={status.error ? "alert" : "status"}
          className={
            status.error
              ? "text-destructive text-xs"
              : "text-muted-foreground text-xs"
          }
        >
          {status.text}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Requer a extensão 0.12.0 ou superior, conectada à mesma conta do
        PromoFlow, e login no programa de afiliados do Mercado Livre. A etiqueta
        utilizada será a cadastrada em Lojas ou, se estiver em branco, a atual
        do gerador.
      </p>
    </div>
  );
}
