"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Copy,
  History,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "./api-error-card";
import { EmptyStateCard } from "./empty-state-card";
import { getActivity } from "@/domains/activity/client";
import type { ActivityEvent, ActivityResource } from "@/domains/activity/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { formatDate } from "@/utils/date";
import { toast } from "@/lib/toast";
export function SupportReference({ event }: { event: ActivityEvent }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <time dateTime={event.createdAt} className="text-muted-foreground">
        {formatDate(event.createdAt, "dd/MM/yyyy HH:mm:ss")}
      </time>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto min-w-0 px-1 py-1 text-xs"
        title="Copiar código de atendimento"
        onClick={(e) => {
          e.stopPropagation();
          void navigator.clipboard
            .writeText(event.supportCode)
            .then(() => toast.success("Código de atendimento copiado."))
            .catch(() => toast.error("Não foi possível copiar o código."));
        }}
      >
        <Copy className="size-3 shrink-0" />
        <span className="max-w-44 truncate">{event.supportCode}</span>
      </Button>
    </div>
  );
}
export function ActivityHistory({
  resource,
  label = "Ver histórico",
}: {
  resource: ActivityResource;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const query = useQuery({
    queryKey: queryKeys.activity.history(session?.user.id, resource),
    queryFn: () => getActivity(resource),
    enabled: open && !!session?.user.id,
    retry: false,
    refetchInterval: (q) => (open && !q.state.error ? 5000 : false),
    refetchIntervalInBackground: false,
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <History className="size-3.5" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Histórico da operação</DialogTitle>
          <DialogDescription>
            Últimos 30 registros, do mais recente para o mais antigo. Use o
            código de atendimento para falar com o suporte.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {query.isPending ? (
            <div aria-label="Carregando histórico" className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : query.isError ? (
            <ApiErrorCard
              title="Não foi possível carregar o histórico"
              error={query.error}
              onRetry={() => void query.refetch()}
              retrying={query.isFetching}
            />
          ) : !query.data?.length ? (
            <EmptyStateCard
              icon={Clock3}
              title="Ainda sem registros"
              description="As próximas mudanças desta operação aparecerão aqui."
            />
          ) : (
            <ol className="space-y-3">
              {query.data.map((event) => {
                const warning =
                  event.status === "ERROR" ||
                  event.status === "FAILED" ||
                  (event.status === "PUBLISHING" &&
                    event.message.includes("sem confirmação"));
                const progress =
                  [
                    "CONNECTING",
                    "AUTHENTICATED",
                    "PUBLISHING",
                    "PROCESSING",
                  ].includes(event.status) && !warning;
                const Icon = warning
                  ? AlertTriangle
                  : progress
                    ? LoaderCircle
                    : CheckCircle2;
                return (
                  <li
                    key={event.id}
                    className="motion-safe:animate-in motion-safe:fade-in bg-muted/20 flex gap-3 rounded-xl border p-3"
                  >
                    <Icon
                      className={
                        "mt-0.5 size-4 shrink-0 " +
                        (warning
                          ? "text-destructive"
                          : progress
                            ? "text-primary motion-safe:animate-spin"
                            : "text-primary")
                      }
                    />
                    <div className="min-w-0 space-y-2">
                      <p className="text-sm leading-relaxed">{event.message}</p>
                      <SupportReference event={event} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
