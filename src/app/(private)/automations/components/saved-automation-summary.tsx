import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Automation } from "@/domains/automations/types";
import { weekdays, type AutomationGroup } from "./automation-types";

export function SavedAutomationSummary({
  initial,
  groups,
  isDirty,
  error,
  pending,
}: {
  initial: Automation;
  groups: AutomationGroup[];
  isDirty: boolean;
  error?: string;
  pending: boolean;
}) {
  return (
    <Card className="border-primary/25">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Configuração salva
            </p>
            <CardTitle className="mt-1 text-xl">
              {initial.enabled ? "Agendamento automático" : "Revisão manual"}
            </CardTitle>
          </div>
          <span role="status" className="text-warning text-sm font-medium">
            {isDirty && "Alterações não salvas"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {initial.enabled && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="bg-muted/40 min-w-0 space-y-1 rounded-lg border p-3">
              <dt className="font-semibold">Destinos</dt>
              <dd>
                <ul
                  className="grid max-h-56 gap-2 overflow-y-auto overscroll-contain pr-1"
                  tabIndex={0}
                  aria-label="Destinos salvos"
                >
                  {initial.groupIds.map((id) => {
                    const group = groups.find(
                      (destination) => destination.id === id
                    );
                    return (
                      <li
                        key={id}
                        className="bg-card flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2"
                      >
                        {group && (
                          <span aria-hidden="true" className="shrink-0">
                            <AnimatedChannelIcon
                              platform={group.platform}
                              compact
                            />
                          </span>
                        )}
                        <span className="min-w-0 text-sm font-medium wrap-break-word">
                          {group?.name ?? "Destino indisponível"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
            <div className="bg-muted/40 space-y-1 rounded-lg border p-3">
              <dt className="font-semibold">Janela de envio</dt>
              {weekdays.filter(({ id }) => initial.days.includes(id)).map(({ id, name }) => {
                const rule = initial.dayRules?.[id] ?? initial;
                return (
                  <dd key={id} className="text-muted-foreground tabular-nums">
                    {name}: {rule.start}–{rule.end} · {rule.dailyLimit}/dia · {rule.intervalMinutes} min
                  </dd>
                );
              })}
            </div>
          </dl>
        )}
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={pending}
            loading={pending}
            className="shrink-0"
          >
            Salvar automação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
