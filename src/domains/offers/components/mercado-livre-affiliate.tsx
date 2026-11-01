"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowUpRight, Link2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isMercadoLivreLink } from "@/domains/offers/affiliate-links";
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{
    url: string;
    text: string;
    pending: boolean;
    error: boolean;
    converted?: boolean;
  } | null>(null);
  const pending = useRef<{ id: string; url: string } | null>(null);
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
        data.feature === "mercado-affiliate-v2"
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
        if (data.ok !== true) pending.current = null;
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
        setFeedback({
          url: sourceUrl,
          text: data.text,
          pending: data.status !== "error",
          error: data.status === "error",
        });
      }
      if (
        data.type === "PROMOFLOW_AFFILIATE_RESULT" &&
        data.accountId === accountId &&
        isMercadoLivreLink(data.affiliateUrl)
      ) {
        onReceive(data.affiliateUrl);
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
      pending.current = null;
    };
  }, [accountId, sourceUrl, onReceive]);
  const begin = useCallback(() => {
    if (!accountId || !isMercadoLivreLink(sourceUrl)) return;
    const id = crypto.randomUUID();
    pending.current = { id, url: sourceUrl };
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
      pending.current = null;
      setFeedback({
        url: sourceUrl,
        text: "A solicitação expirou. Você pode tentar novamente ou preencher seu link manualmente.",
        pending: false,
        error: true,
      });
    }, 90000);
  }, [accountId, sourceUrl]);
  useEffect(() => {
    if (
      !autoConvertKey ||
      !accountId ||
      installed !== true ||
      !isMercadoLivreLink(sourceUrl) ||
      affiliateUrl.trim()
    )
      return;
    const key = `${accountId}:${autoConvertKey}`;
    if (automaticAttempt.current === key) return;
    // Defer until the message listener is attached; cleanup prevents duplicate launches in StrictMode.
    const launch = setTimeout(() => {
      if (automaticAttempt.current === key || pending.current) return;
      automaticAttempt.current = key;
      begin();
    }, 0);
    return () => clearTimeout(launch);
  }, [autoConvertKey, accountId, installed, sourceUrl, affiliateUrl, begin]);
  if (!isMercadoLivreLink(sourceUrl)) return null;
  const status = feedback?.url === sourceUrl ? feedback : null;
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
            onClick={begin}
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
        Requer a extensão 0.8.0 ou superior, conectada à mesma conta do
        PromoFlow, e login no programa de afiliados do Mercado Livre. A etiqueta
        utilizada será a selecionada no gerador da sua conta.
      </p>
    </div>
  );
}
