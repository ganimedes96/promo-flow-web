import { useState } from "react";
import { type Control, type UseFormSetValue, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { ControlledTimePicker } from "@/components/form/controllers/controlled-time-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { weekdays, type ScheduleFormValues } from "./automation-types";

function ScheduleClock({ start, end }: { start: string; end: string }) {
  const [hours = 0, minutes = 0] = (start || "00:00").split(":").map(Number);

  return (
    <div className="bg-card/70 flex flex-col items-center justify-center gap-2 rounded-xl border p-3">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="text-primary size-24"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {Array.from({ length: 12 }, (_, tick) => (
          <path
            key={tick}
            d="M50 11v5"
            transform={`rotate(${tick * 30} 50 50)`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path
            d="M50 50V29"
            strokeWidth="5"
            transform={`rotate(${hours * 30 + minutes / 2} 50 50)`}
          />
          <path
            d="M50 50V19"
            strokeWidth="3"
            transform={`rotate(${minutes * 6} 50 50)`}
          />
          <path
            d="M50 57V14"
            strokeWidth="1.5"
            className="origin-center opacity-65 motion-safe:animate-[spin_60s_linear_infinite]"
          />
        </g>
        <circle cx="50" cy="50" r="4" fill="currentColor" />
      </svg>
      <p className="text-sm font-semibold tabular-nums">
        {start || "—"} – {end || "—"}
      </p>
      <p className="text-muted-foreground text-xs">Janela de envio</p>
    </div>
  );
}

export function ScheduleSettings({
  control,
  planLimit,
  setValue,
}: {
  control: Control<ScheduleFormValues>;
  planLimit?: number;
  setValue: UseFormSetValue<ScheduleFormValues>;
}) {
  const [day, selectDay] = useState(1);
  const rules = useWatch({ control, name: "dayRules" });
  const days = useWatch({ control, name: "dayOptions" });
  const rule = rules[day];
  const enabled = days.includes(String(day));
  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Horários e limites</CardTitle>
        <CardDescription>
          Horário de Brasília. Cada destino conta como uma publicação.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-primary/25 from-primary/10 to-card grid gap-5 rounded-2xl border bg-linear-to-br p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_10rem]">
          <div className="min-w-0 space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Escolha um dia para editar</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {weekdays.map(({ id, name }) => (
                  <Button key={id} type="button" size="sm" aria-pressed={day === id}
                    variant={day === id ? "default" : "outline"}
                    aria-label={name + (days.includes(String(id)) ? ", ativo" : ", pausado")}
                    onClick={() => selectDay(id)}>
                    {days.includes(String(id)) && <Check className="size-3" />}
                    {name.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="outline" aria-pressed={enabled}
                onClick={() => setValue("dayOptions", enabled
                  ? days.filter((value) => value !== String(day))
                  : [...days, String(day)], { shouldDirty: true })}>
                {enabled ? "Pausar" : "Ativar"} {weekdays[day].name.toLowerCase()}
              </Button>
              <Button type="button" size="sm" variant="outline"
                onClick={() => setValue("dayRules", rules.map(() => ({ ...rule })), { shouldDirty: true })}>
                Aplicar a todos os dias
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              A cópia substitui os horários, limites e intervalos. Os dias pausados continuam pausados.
            </p>
            <div key={day} className="grid gap-4 sm:grid-cols-2">
              <ControlledTimePicker
                control={control}
                name={`dayRules.${day}.start`}
                label="Início"
                placeholder="Selecione o início"
              />
              <ControlledTimePicker
                control={control}
                name={`dayRules.${day}.end`}
                label="Fim"
                placeholder="Selecione o fim"
                allowEndOfDay
              />
            </div>
          </div>
          <ScheduleClock start={rule.start} end={rule.end} />
        </div>
        <div key={day} className="grid gap-4 sm:grid-cols-2">
          <ControlledInput
            control={control}
            name={`dayRules.${day}.dailyLimit`}
            label="Limite diário"
            type="number"
            min={1}
            max={planLimit ?? 100000}
            placeholder="50"
          />
          <ControlledSelect
            control={control}
            name={`dayRules.${day}.intervalMinutes`}
            label="Intervalo entre envios automáticos"
            placeholder="Selecione um intervalo"
            className="w-full"
            options={[
              ...new Set([
                2,
                5,
                10,
                15,
                20,
                30,
                45,
                60,
                90,
                120,
                180,
                360,
                720,
                1440,
                Number(rule.intervalMinutes) || 2,
              ]),
            ]
              .sort((a, b) => a - b)
              .map((minutes) => ({
                id: String(minutes),
                name:
                  minutes < 60
                    ? `${minutes} min`
                    : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ""}`,
              }))}
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {planLimit !== undefined
            ? "Seu plano permite até " + planLimit + " publicações por dia. "
            : ""}
          O intervalo mínimo é de 2 minutos.
        </p>
      </CardContent>
    </Card>
  );
}
