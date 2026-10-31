"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowUpRight, Link2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function mercadoLink(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === "meli.la" ||
        url.hostname === "www.meli.la" ||
        url.hostname === "mercadolivre.com.br" ||
        url.hostname.endsWith(".mercadolivre.com.br"))
    );
  } catch {
    return false;
  }
}
export function MercadoLivreAffiliate({
  sourceUrl,
  onReceive,
}: {
  sourceUrl: string;
  onReceive: (url: string) => void;
}) {
  const { data: session } = useSession();
  const accountId = session?.user.id;
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{
    url: string;
    text: string;
    pending: boolean;
    error: boolean;
  } | null>(null);
  const pending = useRef<{ id: string; url: string } | null>(null);
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
        data.feature === "mercado-affiliate-v1"
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
      if (data.type === "PROMOFLOW_AFFILIATE_OPENED")
        setFeedback({
          url: sourceUrl,
          text:
            data.ok === true
              ? "Na loja, gere e copie o link pela sua conta. Confirme no assistente para voltar a este formulário."
              : typeof data.error === "string"
                ? data.error
                : "Não foi possível abrir a loja.",
          pending: data.ok === true,
          error: data.ok !== true,
        });
      if (
        data.type === "PROMOFLOW_AFFILIATE_RESULT" &&
        data.accountId === accountId &&
        mercadoLink(data.affiliateUrl)
      ) {
        onReceive(data.affiliateUrl);
        pending.current = null;
        if (timeout.current) clearTimeout(timeout.current);
        setFeedback({
          url: sourceUrl,
          text: "Link recebido da loja. Confira os dados antes de salvar sua oferta.",
          pending: false,
          error: false,
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
  if (!mercadoLink(sourceUrl)) return null;
  const status = feedback?.url === sourceUrl ? feedback : null;
  const begin = () => {
    if (!accountId) return;
    const id = crypto.randomUUID();
    pending.current = { id, url: sourceUrl };
    if (timeout.current) clearTimeout(timeout.current);
    setFeedback({
      url: sourceUrl,
      text: "Abrindo o produto na loja. Seus campos e grupos ficam preservados aqui.",
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
    }, 600000);
  };
  return (
    <div className="border-primary/25 bg-primary/5 space-y-3 rounded-xl border p-4 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="size-4" /> Seu link do Mercado Livre
          </p>
          <p className="text-muted-foreground mt-1 max-w-xl text-xs">
            Abra a loja, gere o link pela sua conta de afiliado e traga-o para
            este formulário. Os grupos e demais campos ficam preservados.
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
            Preparar meu link
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
        Requer conta habilitada no programa de afiliados e extensão conectada à
        mesma conta do PromoFlow. O sistema não gera uma identificação de
        afiliado por conta própria.
      </p>
    </div>
  );
}
