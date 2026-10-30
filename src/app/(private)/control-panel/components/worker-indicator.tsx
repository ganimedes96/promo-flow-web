"use client";
import { Server, CircleCheck, CirclePause, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppSession } from "@/domains/whatsapp/types";
import { formatDate } from "@/utils/date";
export function WorkerIndicator({
  worker,
  unavailable,
}: {
  worker?: WhatsAppSession["worker"];
  unavailable?: boolean;
}) {
  const online = !unavailable && worker?.status === "ONLINE";
  const enabled = online && worker.publishingEnabled;
  const color = enabled
    ? "text-success border-success/25 bg-success/5"
    : "text-warning border-warning/25 bg-warning/5";
  const label = unavailable
    ? "Não foi possível consultar"
    : !worker || worker.status === "UNKNOWN"
      ? "Aguardando worker"
      : !online
        ? "Worker sem comunicação"
        : enabled
          ? "Worker ativo"
          : "Envios desativados";
  return (
    <div
      className={"whatsapp-connection-subcard rounded-xl border p-4 " + color}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Server className="size-4" aria-hidden="true" />
          Publicador de ofertas
        </p>
        <Badge variant="outline" className="border-current/25 text-current">
          {enabled ? (
            <CircleCheck aria-hidden="true" />
          ) : online ? (
            <CirclePause aria-hidden="true" />
          ) : (
            <CircleAlert aria-hidden="true" />
          )}
          {label}
        </Badge>
      </div>
      <p className="text-foreground mt-2 text-sm">
        {unavailable
          ? "Não foi possível confirmar se o worker está ativo. Aguarde a próxima atualização."
          : !online
            ? "O envio das ofertas depende do worker em execução. Inicie-o com pnpm start na pasta do worker."
            : !enabled
              ? "O worker está ativo e pode sincronizar o WhatsApp. Habilite ENABLE_PUBLISHING para publicar ofertas."
              : "O worker está em comunicação com a API. As ofertas serão enviadas quando o WhatsApp estiver conectado e a fila estiver liberada."}
      </p>
      {worker?.lastSeenAt && (
        <p className="text-muted-foreground mt-2 text-xs">
          Último contato: {formatDate(worker.lastSeenAt, "dd/MM/yyyy HH:mm:ss")}
        </p>
      )}
    </div>
  );
}
