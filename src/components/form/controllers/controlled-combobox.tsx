"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/shadcn/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface ComboboxOption {
  id: string | number;
  name: string;
}

interface ControlledComboboxProps<
  FormType extends FieldValues,
> extends UseControllerProps<FormType> {
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  options?: ComboboxOption[];
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  width?: number | string;
  rightComponent?: React.ReactNode;
}

export function ControlledCombobox<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  placeholder,
  searchPlaceholder = "Pesquisar...",
  noOptionsMessage = "Nenhuma opção encontrada.",
  options = [],
  className,
  disabled,
  loading,
  width = "100%",
  rightComponent,
}: ControlledComboboxProps<FormType>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
      }) => {
        const selectedOption = options.find((option) => option.id === value);

        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={name} className="block text-sm font-medium">
                {label.replace("*", "")}
                {label.includes("*") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {rightComponent && rightComponent}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  ref={ref}
                  type="button"
                  onBlur={onBlur}
                  aria-invalid={!!error}
                  aria-required={!!rules?.required}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  className={cn(
                    "border-input text-muted-foreground min-h-11 justify-between gap-3 rounded-lg border px-4 py-3",
                    error ? "border-destructive" : "",
                    className
                  )}
                  style={{ width: width }}
                >
                  <span className="min-w-0 truncate text-left">
                    {loading
                      ? "Carregando..."
                      : selectedOption?.name || placeholder}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="border-border max-w-[calc(100vw-2rem)] rounded-xl border p-2 shadow-lg"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command className="w-full gap-2 p-1">
                  <CommandInput placeholder={searchPlaceholder} />
                  <CommandList className="max-h-60 overflow-y-auto px-1 pb-1">
                    <CommandEmpty>{noOptionsMessage}</CommandEmpty>
                    <CommandGroup className="p-0 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2">
                      {options.map((option) => (
                        <CommandItem
                          className="data-[selected=true]:border-border rounded-lg border border-transparent px-3 py-3"
                          key={option.id}
                          value={String(option.id)}
                          keywords={[option.name]}
                          onSelect={() => {
                            onChange(value === option.id ? "" : option.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {error?.message && (
              <p className="text-destructive text-sm">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
