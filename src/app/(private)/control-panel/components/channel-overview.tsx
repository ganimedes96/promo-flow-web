"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Users, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWhatsAppConnections } from "@/domains/whatsapp/client";
import { getTelegramPublisherStatus } from "@/domains/telegram-publisher/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import styles from "./channel-overview.module.css";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";

export function ChannelOverview() {
  const { data: session } = useSession();
  const connections = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, session?.user.id],
    queryFn: getWhatsAppConnections,
    enabled: !!session?.user.id,
    retry: false,
    refetchInterval: 10000,
  });
  const accounts = connections.data?.connections ?? [];
  const telegramAccounts = accounts.filter(
    (c) => c.provider === "TELEGRAM_BOT"
  );
  const bot = useQuery({
    queryKey: queryKeys.telegramPublisher.status,
    queryFn: getTelegramPublisherStatus,
    enabled: !!session?.user.id && telegramAccounts.length > 0,
    retry: false,
    refetchInterval: telegramAccounts.length ? 10000 : false,
  });
  if (connections.isPending)
    return (
      <div
        className="grid gap-4 md:grid-cols-2"
        aria-label="Carregando seus canais"
        aria-busy="true"
      >
        {[0, 1].map((index) => (
          <Card key={index} className="gap-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="size-11 rounded-2xl" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-9 w-full" />
          </Card>
        ))}
      </div>
    );
  const workerOnline = connections.data?.worker?.status === "ONLINE";
  return (
    <section
      aria-label="Seus canais de publicação"
      className="grid gap-4 md:grid-cols-2"
    >
      {(["WHATSAPP_WEB_JS", "TELEGRAM_BOT"] as const).map((provider, index) => {
        const telegram = provider === "TELEGRAM_BOT";
        const rows = accounts.filter((c) => c.provider === provider);
        const ready = rows.filter((c) => c.status === "READY");
        const primary = ready.find((c) => c.isDefault) ?? ready[0] ?? rows[0];
        const unavailable =
          !!connections.error || (telegram && rows.length > 0 && !!bot.error);
        const online =
          !unavailable &&
          workerOnline &&
          ready.length > 0 &&
          (!telegram || bot.data?.online === true);
        const preparing = rows.some((c) =>
          ["CONNECTING", "AUTHENTICATED", "WAITING_QR"].includes(c.status)
        );
        const paused =
          online &&
          (connections.data?.worker?.publishingEnabled === false ||
            ready.every((c) => c.isPaused));
        const status = unavailable
          ? "Não foi possível confirmar"
          : online
            ? "Conectado"
            : preparing
              ? "Conexão em andamento"
              : ready.length
                ? "Aguardando publicador"
                : rows.length
                  ? "Desconectado"
                  : "Não conectado";
        const groups = rows.reduce(
          (total, c) => total + (c.groupCount ?? 0),
          0
        );
        const href = telegram
          ? "/connections?platform=telegram"
          : "/connections";
        return (
          <Card
            key={provider}
            className={`${styles.card} ${telegram ? styles.telegram : ""}`}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div aria-hidden="true" className={styles.texture} />
            <div aria-hidden="true" className={styles.orbit} />
            <CardContent className="relative flex h-full flex-col gap-4 px-5 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <AnimatedChannelIcon
                  platform={telegram ? "telegram" : "whatsapp"}
                />
                <Badge
                  className={`justify-center gap-2 text-xs ${online ? "border-emerald-700 bg-emerald-700 text-white" : unavailable ? "border-destructive bg-destructive text-destructive-foreground" : "border-amber-600 bg-amber-600 text-white"}`}
                >
                  <span
                    className="relative flex size-1.5 shrink-0"
                    aria-hidden="true"
                  >
                    {online && (
                      <span className="absolute inline-flex size-full rounded-full bg-white opacity-40 motion-safe:animate-ping" />
                    )}
                    <span className="relative inline-flex size-full rounded-full bg-current" />
                  </span>
                  {status}
                </Badge>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">
                  {telegram ? "Telegram" : "WhatsApp"}
                </h2>
                <p className="text-muted-foreground mt-1 min-h-10 text-sm leading-5">
                  {unavailable
                    ? "Atualize o status ou acesse Conexões para conferir sua conta."
                    : online
                      ? telegram
                        ? "Seu bot está pronto para publicar nos grupos e canais vinculados."
                        : "Sua conta está pronta para levar ofertas aos grupos."
                      : ready.length
                        ? "A sessão está salva. Aguarde o publicador para confirmar a conexão."
                        : telegram
                          ? "Vincule um grupo ou canal ao bot e publique suas ofertas."
                          : "Conecte seu número e escolha os grupos que receberão suas ofertas."}
                </p>
              </div>
              <div className="border-border/70 bg-background/40 flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs">
                <span
                  className="min-w-0 truncate font-medium"
                  title={primary?.connectedName ?? undefined}
                >
                  {primary?.connectedName ||
                    primary?.name ||
                    (telegram ? "Bot do PromoFlow" : "Sua conta WhatsApp")}
                </span>
                <span className="text-muted-foreground flex shrink-0 items-center gap-1.5">
                  <Users className="size-3.5" />
                  {groups} {telegram ? "destinos" : "grupos"}
                </span>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Button asChild className="group flex-1">
                  <Link href={href}>
                    {rows.length
                      ? telegram
                        ? "Gerenciar Telegram"
                        : "Gerenciar WhatsApp"
                      : telegram
                        ? "Vincular Telegram"
                        : "Conectar WhatsApp"}
                    <ArrowUpRight className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
                {unavailable && (
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={
                      "Atualizar " + (telegram ? "Telegram" : "WhatsApp")
                    }
                    disabled={connections.isFetching || bot.isFetching}
                    onClick={() => {
                      void connections.refetch();
                      if (telegram && rows.length) void bot.refetch();
                    }}
                  >
                    <RefreshCw
                      className={
                        connections.isFetching || bot.isFetching
                          ? "size-4 animate-spin"
                          : "size-4"
                      }
                    />
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground text-[11px]">
                {paused
                  ? "Conexão ativa · envios pausados"
                  : online
                    ? `${ready.length} conexão${ready.length === 1 ? " pronta" : "es prontas"} · detalhes em Conexões`
                    : telegram
                      ? "Envio por bot · sem QR Code"
                      : "Envio pela sua conta · vínculo por QR Code"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
