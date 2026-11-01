import { Badge } from "@/components/ui/badge";
const labels: Record<string, string> = {
  CONNECTED: "Conectada",
  AUTHENTICATED: "Autenticada",
  SUCCESS: "Enviada",
  PROCESSING: "Processando",
  READY: "Pronta",
  SCHEDULED: "Agendada",
  PUBLISHING: "Enviando",
  PUBLISHED: "Publicada",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
  DISCONNECTED: "Desconectada",
  CONNECTING: "Conectando",
  WAITING_QR: "Aguardando QR",
  WAITING_PASSWORD: "Aguardando senha",
  ERROR: "Erro",
  STARTED: "Iniciada",
  SENT: "Enviada",
  UNKNOWN: "Sem confirmação",
  CONFIRMED: "Confirmada",
  SUCCEEDED: "Concluída",
  WAITING: "Aguardando extensão",
  CONVERTING: "Convertendo",
  RECONNECT: "Reconectar loja",
  APPLIED: "Link aplicado",
  STORE_REQUIRED: "Configurar loja",
  PENDING: "Link pendente",
};
export function SupportStatus({ status }: { status: string }) {
  const color = [
    "CONNECTED",
    "SUCCESS",
    "PUBLISHED",
    "SENT",
    "CONFIRMED",
    "SUCCEEDED",
    "APPLIED",
  ].includes(status)
    ? "bg-emerald-700 text-white"
    : ["FAILED", "ERROR", "UNKNOWN", "RECONNECT"].includes(status)
      ? "bg-rose-700 text-white"
      : ["CANCELLED", "DISCONNECTED"].includes(status)
        ? "bg-orange-600 text-white"
        : "bg-sky-700 text-white";
  return (
    <Badge className={"justify-center " + color}>
      {labels[status] ?? status}
    </Badge>
  );
}
