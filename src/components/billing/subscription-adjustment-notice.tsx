"use client";

import { CalendarClock, SlidersHorizontal } from "lucide-react";
import type { BillingStatus } from "@/domains/billing/subscription-types";
import type { SubscriptionPlan } from "@/domains/billing/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";

type Subscription = NonNullable<BillingStatus["subscription"]>;

const fields = [
  ["maxGroups", "Grupos de destino"],
  ["maxConnections", "Conexões WhatsApp"],
  ["maxMirroredGroups", "Grupos espelhados"],
  ["maxDailyPublications", "Publicações por dia"],
  ["maxStores", "Lojas de afiliados"],
  ["watermarkEnabled", "Marca d’água"],
] as const;

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

export function SubscriptionAdjustmentNotice({
  subscription,
  plan,
}: {
  subscription: Subscription;
  plan?: SubscriptionPlan | null;
}) {
  const adjustment = subscription.customAdjustment;
  if (!adjustment) return null;

  const changed = fields.filter(([key]) => {
    const next = adjustment.limits[key];
    return next !== undefined && (!plan || next !== plan[key]);
  });
  return (
    <Card className="border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-card to-card">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2 text-amber-700 dark:text-amber-300">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Alteração da assinatura prevista</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Novo valor previsto a partir de {formatDate(adjustment.effectiveAt, "dd/MM/yyyy")}.
              </p>
            </div>
          </div>
          <Badge className="bg-amber-400 text-amber-950">Programada</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-background/70 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Mensalidade atual</p>
            <p className="mt-1 text-lg font-semibold">{money(subscription.priceCents)}</p>
          </div>
          <div className="bg-background/70 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Nova mensalidade</p>
            <p className="mt-1 text-lg font-semibold">{money(adjustment.priceCents)} / mês</p>
          </div>
        </div>
        {changed.length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4" /> Recursos previstos
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {changed.map(([key, label]) => {
                const next = adjustment.limits[key];
                const previous = plan?.[key];
                const display = (value: number | boolean | undefined) =>
                  typeof value === "boolean" ? (value ? "Liberada" : "Desativada") : value;
                return (
                  <li key={key} className="bg-background/60 rounded-lg border p-3 text-sm">
                    <span className="text-muted-foreground">{label}: </span>
                    {previous !== undefined && <>{display(previous)} → </>}
                    <strong>{display(next)}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <p className="text-muted-foreground text-xs leading-relaxed">
          Confira seus limites atuais nos indicadores abaixo. Eventuais reduções
          entram em vigor após o pagamento do novo ciclo; cobranças já emitidas
          mantêm o valor anterior. Em caso de dúvida, fale com o suporte.
        </p>
      </CardContent>
    </Card>
  );
}
