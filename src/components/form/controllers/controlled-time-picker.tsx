"use client";

import { Clock } from "lucide-react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ControlledTimePickerProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  description?: string;
  placeholder?: string;
  allowEndOfDay?: boolean;
}

const hours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
const minutes = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

export function ControlledTimePicker<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  placeholder = "Selecione um horário",
  allowEndOfDay = false,
}: ControlledTimePickerProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const time = typeof value === "string" ? value : "";
        const [hour = "00", minute = "00"] = time.split(":");
        const availableMinutes = hour === "24" ? ["00"] : minutes;

        return (
          <div className="flex flex-col gap-1">
            <Label className="block text-sm font-medium">{label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  aria-invalid={!!error}
                  className={`w-full justify-start gap-2 font-normal ${error ? "border-destructive" : ""}`}
                >
                  <Clock className="text-muted-foreground size-4" />
                  <span className={time ? "text-foreground" : "text-muted-foreground"}>
                    {time === "24:00" ? "24:00 · fim do dia" : time || placeholder}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 space-y-4 p-4">
                <div>
                  <p className="text-sm font-semibold">Escolha o horário</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Selecione hora e minuto.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`${name}-hour`} className="text-xs">
                      Hora
                    </Label>
                    <Select
                      value={hour}
                      onValueChange={(nextHour) =>
                        onChange(
                          nextHour === "24" ? "24:00" : `${nextHour}:${minute}`,
                        )
                      }
                    >
                      <SelectTrigger id={`${name}-hour`} className="w-full">
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                        {allowEndOfDay && (
                          <SelectItem value="24">24 · fim do dia</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`${name}-minute`} className="text-xs">
                      Minuto
                    </Label>
                    <Select
                      value={hour === "24" ? "00" : minute}
                      onValueChange={(nextMinute) =>
                        onChange(`${hour}:${nextMinute}`)
                      }
                      disabled={hour === "24"}
                    >
                      <SelectTrigger id={`${name}-minute`} className="w-full">
                        <SelectValue placeholder="Minuto" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {availableMinutes.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {allowEndOfDay && (
                  <p className="text-muted-foreground rounded-lg border bg-muted/40 p-2.5 text-xs leading-relaxed">
                    24:00 representa a meia-noite no fim do dia e mantém a janela
                    de envio aberta durante todo o dia.
                  </p>
                )}
                {error?.message && (
                  <p className="text-destructive text-sm">{error.message}</p>
                )}
              </PopoverContent>
            </Popover>
            {description && !error && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
            {error?.message && (
              <p className="text-destructive text-sm">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
