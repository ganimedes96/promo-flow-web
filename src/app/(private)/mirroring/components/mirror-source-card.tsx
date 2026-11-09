"use client";
import {
  Radio,
  Pause,
  Play,
  Trash2,
  Clock3,
  PackageOpen,
  ShieldCheck,
} from "lucide-react";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/shadcn/utils";

type Props = {
  platform: "whatsapp" | "telegram";
  name: string;
  account: string;
  enabled: boolean;
  available: boolean;
  unavailableLabel: string;
  capturedCount: number;
  lastCapturedAt?: string | null;
  lastCheckedAt?: string | null;
  captureError?: string | null;
  busy: boolean;
  toggleDisabled: boolean;
  onToggle: () => void;
  onRemove: () => void;
  destinationSettings?: React.ReactNode;
};

export function MirrorSourceCard(props: Props) {
  const active = props.enabled && props.available;
  const telegram = props.platform === "telegram";

  const status = !props.available
    ? props.unavailableLabel
    : props.enabled
      ? "Captura habilitada"
      : "Captura pausada";
  return (
    <Card
      className={cn(
        "relative min-w-0 overflow-hidden border pt-0 transition-shadow motion-safe:hover:shadow-lg",
        telegram ? "border-sky-500/30" : "border-emerald-500/30"
      )}
    >
      <div
        className={cn("h-1.5", telegram ? "bg-sky-500" : "bg-emerald-500")}
      />
      <CardContent className="flex h-full flex-col gap-5 px-5 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "flex items-center gap-2 text-xs font-semibold",
              telegram
                ? "text-sky-700 dark:text-sky-300"
                : "text-emerald-700 dark:text-emerald-300"
            )}
          >
            <AnimatedChannelIcon platform={props.platform} compact />
            {telegram ? "Telegram" : "WhatsApp"}
          </span>
          <Badge
            className={cn(
              "justify-center gap-1.5 border-0 text-white",
              active
                ? "bg-emerald-600"
                : props.available
                  ? "bg-amber-600"
                  : "bg-rose-600"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full bg-white",
                active && "motion-safe:animate-pulse"
              )}
            />
            {status}
          </Badge>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
              telegram
                ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            )}
          >
            {props.name.slice(0, 2).toLocaleUpperCase("pt-BR")}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold" title={props.name}>
              {props.name}
            </h2>
            <p
              className="text-muted-foreground mt-1 truncate text-xs"
              title={props.account}
            >
              {props.account}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "grid grid-cols-2 gap-3 rounded-xl border p-3",
            telegram
              ? "border-sky-500/15 bg-sky-500/5"
              : "border-emerald-500/15 bg-emerald-500/5"
          )}
        >
          <div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <PackageOpen className="size-3.5" />
              Capturadas
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {props.capturedCount.toLocaleString("pt-BR")}
            </p>
            <p className="text-muted-foreground text-xs">
              ofertas nesta origem
            </p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock3 className="size-3.5" />
              Última captura
            </p>
            <p className="mt-2 text-sm font-semibold">
              {props.lastCapturedAt
                ? formatDate(props.lastCapturedAt, "dd/MM · HH:mm")
                : "Aguardando"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {props.lastCapturedAt
                ? "Mensagem com produto"
                : "Nenhuma oferta ainda"}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <Radio className="mt-0.5 size-4 shrink-0" />
          {!props.available
            ? "A captura aguarda a conexão e o acesso a esta origem."
            : props.enabled
              ? "Novas mensagens com produtos serão capturadas enquanto o coletor estiver ativo."
              : "Novas capturas estão pausadas. As ofertas anteriores continuam salvas."}
        </p>
        {props.lastCheckedAt && (
          <p className="text-muted-foreground text-xs">
            Última verificação:{" "}
            {formatDate(props.lastCheckedAt, "dd/MM · HH:mm")}
          </p>
        )}
        {props.captureError && (
          <p
            role="status"
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-700 dark:text-rose-300"
          >
            {props.captureError}
          </p>
        )}
        {props.destinationSettings}
        <div className="mt-auto flex items-center gap-2 border-t pt-4">
          <Button
            className="flex-1"
            size="sm"
            variant="outline"
            disabled={props.busy || props.toggleDisabled}
            onClick={props.onToggle}
          >
            {props.enabled ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {props.enabled ? "Pausar captura" : "Retomar captura"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={props.busy}
            aria-label={"Remover origem " + props.name}
            onClick={props.onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-[11px]">
          <ShieldCheck className="size-3.5" />
          Ofertas privadas
        </p>
      </CardContent>
    </Card>
  );
}
