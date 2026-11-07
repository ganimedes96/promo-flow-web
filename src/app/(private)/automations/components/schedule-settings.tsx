import { Controller, type Control, useWatch } from "react-hook-form";
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

function ScheduleClock({ control }: { control: Control<ScheduleFormValues> }) {
  const [start, end] = useWatch({ control, name: ["start", "end"] });
  const [hours = 0, minutes = 0] = start.split(":").map(Number);

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
  initialInterval,
}: {
  control: Control<ScheduleFormValues>;
  planLimit?: number;
  initialInterval: number;
}) {
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
            <Controller
              control={control}
              name="dayOptions"
              render={({ field }) => (
                <fieldset className="min-w-0 space-y-2">
                  <legend className="text-sm font-medium">Dias de envio</legend>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {weekdays.map(({ id, name }) => {
                      const value = String(id);
                      const selected = field.value.includes(value);
                      return (
                        <Button
                          key={id}
                          type="button"
                          variant="outline"
                          aria-label={name}
                          aria-pressed={selected}
                          onBlur={field.onBlur}
                          onClick={() =>
                            field.onChange(
                              selected
                                ? field.value.filter((day) => day !== value)
                                : [...field.value, value]
                            )
                          }
                          className="border-border bg-card h-14 flex-col gap-1 rounded-xl px-1 aria-pressed:border-lime-700 aria-pressed:bg-lime-50 aria-pressed:text-lime-800 aria-pressed:hover:bg-lime-100 aria-pressed:hover:text-lime-800 motion-safe:transition-all motion-safe:hover:-translate-y-0.5 dark:aria-pressed:border-lime-300/60 dark:aria-pressed:bg-lime-300/10 dark:aria-pressed:text-lime-300 dark:aria-pressed:hover:bg-lime-300/15 dark:aria-pressed:hover:text-lime-300"
                        >
                          <span>{name.slice(0, 3)}</span>
                          {selected ? (
                            <span
                              aria-hidden="true"
                              className="grid size-3.5 place-items-center rounded-full bg-lime-300 text-lime-950"
                            >
                              <Check className="size-3" strokeWidth={3} />
                            </span>
                          ) : (
                            <span
                              aria-hidden="true"
                              className="size-3.5 rounded-full border border-current opacity-40"
                            />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledTimePicker
                control={control}
                name="start"
                label="Início"
                placeholder="Selecione o início"
              />
              <ControlledTimePicker
                control={control}
                name="end"
                label="Fim"
                placeholder="Selecione o fim"
                allowEndOfDay
              />
            </div>
          </div>
          <ScheduleClock control={control} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ControlledInput
            control={control}
            name="dailyLimit"
            label="Limite diário"
            type="number"
            min={1}
            max={planLimit ?? 100000}
            placeholder="50"
          />
          <ControlledSelect
            control={control}
            name="intervalMinutes"
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
                initialInterval,
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
