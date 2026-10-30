"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronDown, XIcon } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useState, useRef } from "react";
import React from "react";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    name: string;
    id: string | number;
    icon?: React.ComponentType<{ className?: string }>;
  }[];

  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  selected?: string[];
  maxSelected?: number;
  searchable?: boolean;
  placeholder?: string;
  maxCount?: number;
  modalPopover?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      selected,
      maxSelected,
      searchable = options.length > 10,
      placeholder = "Selecione...",
      maxCount = 3,
      modalPopover = false,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValues, setInternalValues] =
      useState<string[]>(defaultValue);
    const selectedValues = selected ?? internalValues;
    const setSelectedValues = (next: string[]) => {
      if (selected === undefined) setInternalValues(next);
    };
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const clearButtonRef = useRef<HTMLDivElement>(null);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      if (
        maxSelected &&
        selectedValues.length >= maxSelected &&
        !selectedValues.includes(option)
      )
        return;
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      onValueChange([]);
      return false;
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      const allValues = options
        .map((option) => String(option.id))
        .slice(0, maxSelected ?? options.length);
      const next =
        allValues.length === selectedValues.length &&
        allValues.every((value) => selectedValues.includes(value))
          ? []
          : allValues;
      setSelectedValues(next);
      onValueChange(next);
    };

    const handleRemoveItem = (value: string, e: React.MouseEvent) => {
      e.stopPropagation();
      toggleOption(value);
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "border-border bg-card hover:bg-card/80 flex h-auto min-h-10 w-full items-center justify-between rounded-md border p-1",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => String(o.id) === value);
                    const IconComponent = option?.icon;
                    return (
                      <Badge
                        key={value}
                        className={cn(multiSelectVariants({ variant }))}
                        onClick={(e) => handleRemoveItem(value, e)}
                      >
                        {IconComponent && (
                          <IconComponent className="mr-2 h-4 w-4" />
                        )}
                        {option?.name}
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "text-foreground border-foreground/1 cursor-pointer bg-transparent hover:bg-transparent",
                        multiSelectVariants({ variant })
                      )}
                      onClick={clearExtraOptions}
                    >
                      {`+ ${selectedValues.length - maxCount}`}
                    </Badge>
                  )}
                </div>
                <div
                  className="flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                  ref={clearButtonRef}
                >
                  <div onClick={handleClear} className="cursor-pointer p-1">
                    <XIcon className="text-muted-foreground mx-2 h-4" />
                  </div>
                  <Separator
                    orientation="vertical"
                    className="flex h-full min-h-6"
                  />
                  <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <span className="text-muted-foreground mx-3 text-sm">
                  {placeholder}
                </span>
                <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            {searchable && (
              <CommandInput
                placeholder="Pesquisar..."
                onKeyDown={handleInputKeyDown}
              />
            )}
            <CommandList>
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      selectedValues.length ===
                        Math.min(options.length, maxSelected ?? options.length)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>
                    {maxSelected && options.length > maxSelected
                      ? `Selecionar os primeiros ${maxSelected}`
                      : "Selecionar todos"}
                  </span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(String(option.id));
                  return (
                    <CommandItem
                      key={option.id}
                      disabled={
                        !!maxSelected &&
                        selectedValues.length >= maxSelected &&
                        !isSelected
                      }
                      onSelect={() => toggleOption(String(option.id))}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                      )}
                      <span>{option.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
