"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  MessageCircle,
  Pause,
  Play,
  Puzzle,
  RefreshCw,
  Sparkles,
  Star,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWhatsAppConnections,
  getWhatsAppGroups,
} from "@/domains/whatsapp/client";
import { getOffers } from "@/domains/offers/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { GuideMascot } from "./mascot";
import { useExtensionStatus } from "./use-extension-status";
import styles from "./guide.module.css";
const storageEvent = "promoflow-guide-change";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(storageEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(storageEvent, listener);
  };
}
const serverSnapshot = () => false;
export function GettingStartedGuide({ userId }: { userId: string }) {
  const [paused, setPaused] = useState(false);
  const storageKey = `promoflow:getting-started:${userId}`;
  const collapsed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) === "collapsed";
      } catch {
        return false;
      }
    },
    serverSnapshot
  );
  const [fallbackCollapsed, setFallbackCollapsed] = useState(false);
  const setCollapsed = (value: boolean) => {
    try {
      localStorage.setItem(storageKey, value ? "collapsed" : "open");
      window.dispatchEvent(new Event(storageEvent));
    } catch {
      setFallbackCollapsed(value);
    }
  };
  const extension = useExtensionStatus(userId);
  const connections = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, userId],
    queryFn: getWhatsAppConnections,
    refetchInterval: collapsed ? false : 15000,
    retry: false,
  });
  const connected =
    connections.data?.connections.filter(
      (account) => account.status === "READY" && account.connectedPhone
    ) ?? [];
  const groups = useQuery({
    queryKey: [...queryKeys.whatsapp.groupsFor(), userId],
    queryFn: () => getWhatsAppGroups(),
    enabled: connected.length > 0,
    refetchInterval: collapsed ? false : 15000,
    retry: false,
  });
  const offers = useQuery({
    queryKey: queryKeys.offers.list({ userId, page: 1, limit: 1 }),
    queryFn: () => getOffers({ page: 1, limit: 1 }),
    refetchInterval: collapsed ? false : 15000,
    retry: false,
  });
  const hasFavorites =
    groups.data?.some(
      (group) =>
        group.isFavorite &&
        connected.some(
          (account) =>
            account.id === group.connectionId &&
            account.connectedPhone === group.accountPhone
        )
    ) ?? false;
  const steps = [
    {
      icon: Puzzle,
      title: "Instale e conecte a extensão",
      text:
        extension.status === "missing"
          ? "Baixe a extensão, instale no Chrome e conecte à sua conta do PromoFlow."
          : extension.status === "disconnected"
            ? "Abra a extensão e conecte à mesma conta que está usando aqui."
            : extension.status === "unavailable"
              ? "Recarregue a extensão atualizada e confira a conexão com sua conta."
              : "Capture os produtos das lojas sem preencher tudo à mão.",
      href: "/extension",
      action: "Configurar extensão",
      done: extension.status === "connected",
      checking: extension.status === "checking",
    },
    {
      icon: MessageCircle,
      title: "Conecte seu WhatsApp",
      text: "Abra Conexões e leia o QR Code em Aparelhos conectados no celular.",
      href: "/connections",
      action: "Conectar WhatsApp",
      done: connected.length > 0,
    },
    {
      icon: Star,
      title: "Escolha seus grupos",
      text: "Marque como favoritos os grupos em que deseja compartilhar suas ofertas.",
      href: "/groups",
      action: "Escolher grupos",
      done: hasFavorites,
    },
    {
      icon: ShoppingBag,
      title: "Prepare sua primeira oferta",
      text: "Escolha um produto na Central, confira os dados e seu link de afiliado e salve. Agendar o envio é uma ação separada.",
      href: "/promotions",
      action: "Explorar promoções",
      done: (offers.data?.pagination.total ?? 0) > 0,
    },
  ];
  const complete = steps.filter((step) => step.done).length;
  const current = steps.findIndex((step) => !step.done);
  const loading =
    connections.isPending ||
    offers.isPending ||
    (connected.length > 0 && groups.isPending);
  const error =
    connections.isError ||
    offers.isError ||
    (connected.length > 0 && groups.isError);
  if (collapsed || fallbackCollapsed)
    return (
      <section className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Flag className="text-primary size-4" />
          Seu guia de primeiros passos
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFallbackCollapsed(false);
            setCollapsed(false);
          }}
        >
          Retomar guia
          <ChevronDown className="size-4" />
        </Button>
      </section>
    );
  return (
    <section
      className={`bg-card relative overflow-hidden rounded-2xl border ${styles.guide}`}
      aria-labelledby="getting-started-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3.5" />
          PRIMEIROS PASSOS
        </Badge>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Reproduzir animação" : "Pausar animação"}
          >
            {paused ? <Play /> : <Pause />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)}>
            Continuar depois
            <ChevronUp className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr] lg:p-7">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div
            className={`relative flex w-full justify-center rounded-2xl ${styles.scene}`}
          >
            <span className={styles.orbit} aria-hidden="true" />
            <GuideMascot paused={paused} />
            <span
              className={`${styles.floating} bg-primary text-primary-foreground`}
              aria-hidden="true"
            >
              <Check size={18} />
            </span>
          </div>
          <h2 id="getting-started-title" className="mt-4 text-xl font-semibold">
            {complete === 4
              ? "Tudo pronto para dar flow!"
              : "Vamos preparar seu primeiro achado?"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {complete === 4
              ? "Sua configuração está pronta e a primeira oferta foi salva. Você escolhe quando colocá-la na fila."
              : "A capivara te acompanha. Complete os passos no seu ritmo; o progresso é conferido automaticamente."}
          </p>
          <div className="mt-5 w-full">
            <div className="mb-2 flex justify-between text-xs">
              <span>
                {loading
                  ? "Conferindo seu progresso…"
                  : `${complete} de 4 etapas concluídas`}
              </span>
              <span>{loading ? "" : `${complete * 25}%`}</span>
            </div>
            <Progress
              value={loading ? 0 : complete * 25}
              aria-label="Progresso dos primeiros passos"
            />
          </div>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div
              aria-label="Conferindo primeiros passos"
              role="status"
              className="space-y-3"
            >
              {[0, 1, 2, 3].map((value) => (
                <Skeleton key={value} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <ol className="space-y-3">
              {steps.map(
                (
                  { icon: Icon, title, text, href, action, done, checking },
                  index
                ) => (
                  <li
                    key={href}
                    className={`bg-background/70 flex gap-3 rounded-xl border p-4 ${index === current ? "border-primary/50 ring-primary/10 ring-2" : ""}`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {done ? <Check size={18} /> : <Icon size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {index + 1}. {title}
                        </h3>
                        {done && (
                          <Badge variant="secondary" className="text-[10px]">
                            Concluído
                          </Badge>
                        )}
                        {checking && (
                          <span className="text-muted-foreground text-xs">
                            Verificando…
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {text}
                      </p>
                      {!done && (
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="mt-1 h-auto justify-start px-0"
                        >
                          <Link href={href}>
                            {action}
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </li>
                )
              )}
            </ol>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs">
              Seu progresso fica vinculado à sua conta.
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                extension.refresh();
                void connections.refetch();
                if (connected.length) void groups.refetch();
                void offers.refetch();
              }}
            >
              <RefreshCw className="size-3.5" />
              Conferir progresso
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-destructive text-xs">
              Não conseguimos conferir todas as etapas agora. Seu progresso não
              foi apagado. Tente conferir novamente.
            </p>
          )}
          {complete === 4 && (
            <Button asChild className="w-full">
              <Link href="/offers">
                Ver minhas ofertas
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
