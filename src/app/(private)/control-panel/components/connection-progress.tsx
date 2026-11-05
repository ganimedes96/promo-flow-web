"use client";
import { CheckCircle2, LoaderCircle, QrCode, ShieldCheck, Wifi } from "lucide-react";
import {
  ActivityHistory,
  SupportReference,
} from "@/components/feedback/activity-history";
import { Button } from "@/components/ui/button";
import type { WhatsAppSession } from "@/domains/whatsapp/types";
export function ConnectionProgress({
  session,
  busy,
  onRetry,
}: {
  session: WhatsAppSession;
  busy: boolean;
  onRetry: () => void;
}) {
  const event = session.activityEvents?.[0];
  const failed = session.status === "ERROR";
  const steps = [
    { status: "CONNECTING", label: "Preparar conexão", icon: LoaderCircle },
    { status: "WAITING_QR", label: "Ler QR Code", icon: QrCode },
    { status: "AUTHENTICATED", label: "Confirmar conta", icon: ShieldCheck },
    { status: "READY", label: "Conectado", icon: Wifi },
  ];
  const index = steps.findIndex((step) => step.status === session.status);
  return (
    <div className="mt-4 space-y-3">
      {index >= 0 && (
        <ol
          aria-label="Etapas da conexão"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {steps.map((step, i) => {
            const active = i === index,
              done = i < index || session.status === "READY";
            const Icon = done ? CheckCircle2 : step.icon;
            return (
              <li
                key={step.status}
                aria-current={active ? "step" : undefined}
                className={
                  "rounded-lg border p-2 text-xs " +
                  (active
                    ? "border-primary/50 bg-primary/10"
                    : "text-muted-foreground")
                }
              >
                <Icon
                  className={
                    "mb-1 size-4 " +
                    (done ? "text-emerald-500 dark:text-emerald-400 " : "") +
                    (active && !done && step.status === "CONNECTING"
                      ? "motion-safe:animate-spin"
                      : "")
                  }
                />
                {step.label}
              </li>
            );
          })}
        </ol>
      )}
      {failed && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 space-y-3 rounded-xl border p-4"
        >
          <p className="text-sm font-medium">
            Não foi possível concluir a conexão
          </p>
          <p className="text-muted-foreground text-sm">
            {event?.message ??
              "Tente conectar novamente. Se continuar, procure o suporte."}
          </p>
          {event && <SupportReference event={event} />}
          <Button type="button" size="sm" disabled={busy} onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
      {!failed && event && <SupportReference event={event} />}
      {session.id && (
        <ActivityHistory resource={{ connectionId: session.id }} />
      )}
    </div>
  );
}
