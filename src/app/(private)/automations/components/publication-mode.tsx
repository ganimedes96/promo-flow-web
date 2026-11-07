import type { Control } from "react-hook-form";
import { ShieldAlert } from "lucide-react";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ScheduleFormValues } from "./automation-types";

export function PublicationMode({
  control,
  enabled,
}: {
  control: Control<ScheduleFormValues>;
  enabled: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>1. Modo de publicação</CardTitle>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? "bg-lime-300 text-lime-950" : "bg-amber-300 text-amber-950"}`}
          >
            {enabled ? "Agendamento automático" : "Revisão manual"}
          </span>
        </div>
        <CardDescription>
          Com a automação desligada, as ofertas novas ficam para revisão e os
          envios automáticos pendentes aguardam a reativação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ControlledSwitch
          control={control}
          name="enabled"
          label="Agendar automaticamente"
          description={
            enabled
              ? "As ofertas elegíveis entram na fila automática."
              : "Você revisa e agenda cada oferta."
          }
          switchClassName="cursor-pointer data-[size=default]:h-6 data-[size=default]:w-11 data-[state=unchecked]:border-muted-foreground/60 data-[state=unchecked]:bg-muted dark:data-[state=unchecked]:bg-muted data-[state=checked]:bg-primary [&_[data-slot=switch-thumb]]:bg-white dark:[&_[data-slot=switch-thumb]]:bg-white [&_[data-state=checked][data-slot=switch-thumb]]:translate-x-5 [&_[data-state=unchecked][data-slot=switch-thumb]]:translate-x-1"
        />
        <aside className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <ShieldAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300"
          />
          <div className="space-y-1">
            <p className="font-medium">
              Risco de bloqueio do número no WhatsApp
            </p>
            <p className="text-muted-foreground">
              Envios automáticos frequentes ou mensagens denunciadas como spam
              podem levar a restrições ou ao bloqueio do número. Envie apenas
              para grupos que esperam receber suas ofertas. O intervalo entre
              envios reduz a frequência, mas o risco continua.
            </p>
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}
