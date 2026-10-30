"use client";

import React from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { MultiSelect } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";

interface Option {
  id: string | number;
  name: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
}

interface ControlledMultiSelectProps<FormType extends FieldValues> extends Omit<
  UseControllerProps<FormType>,
  "defaultValue"
> {
  label: string;
  options?: Option[];
  placeholder?: string;
  variant?: "default" | "inverted";
  maxCount?: number;
  loading?: boolean;
  maxSelected?: number;
  searchable?: boolean;
}

export function ControlledMultiSelect<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  options = [],
  placeholder = "Selecione uma opção",
  variant = "inverted",
  maxCount,
  loading,
  maxSelected,
  searchable,
}: ControlledMultiSelectProps<FormType>) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name} className="block text-sm font-medium">
        {label.replace("*", "")}
        {rules?.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => {
          return (
            <div className="flex flex-col gap-1">
              <MultiSelect
                ref={field.ref}
                options={options}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                id={name}
                aria-invalid={!!error}
                type="button"
                selected={
                  Array.isArray(field.value)
                    ? field.value
                        .filter(
                          (value: unknown) =>
                            typeof value === "string" ||
                            typeof value === "number"
                        )
                        .map(String)
                    : []
                }
                searchable={searchable}
                maxSelected={maxSelected}
                placeholder={loading ? "Carregando..." : placeholder}
                variant={variant}
                maxCount={maxCount}
                className={`${error ? "border-destructive" : ""}`}
              />
              {error && (
                <p className="text-destructive text-sm">{error.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
