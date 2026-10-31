"use client";
import { CloudOff, RefreshCw, CircleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shadcn/utils";
export function ApiErrorCard({
  title = "Não foi possível carregar esta página",
  description = "Houve uma falha ao consultar o servidor. Aguarde um instante e tente novamente.",
  onRetry,
  retrying = false,
  className,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <Card
      role="alert"
      aria-busy={retrying}
      className={cn(
        "border-border/70 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 relative mx-auto w-full max-w-xl gap-0 overflow-hidden rounded-2xl py-0 shadow-lg shadow-black/5 motion-safe:duration-500",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="from-primary/10 to-card relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-b sm:h-52"
      >
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:18px_18px] opacity-[0.08]" />
        <div className="border-primary/25 absolute size-40 rounded-full border border-dashed [animation-duration:24s] motion-safe:animate-spin" />
        <div className="bg-primary/10 absolute size-28 rounded-full motion-safe:animate-pulse" />
        <div className="border-primary/20 bg-card relative flex size-20 items-center justify-center rounded-2xl border shadow-sm">
          <CloudOff className="text-primary size-9 stroke-[1.5]" />
          <span className="border-card bg-warning absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border-4 text-slate-950">
            <CircleAlert className="size-3.5" />
          </span>
        </div>
      </div>
      <CardContent className="relative space-y-5 px-6 pb-8 text-center sm:px-10">
        <div className="space-y-3">
          <span className="border-warning/25 bg-warning/10 text-warning inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium">
            <span className="size-1.5 rounded-full bg-current" />
            Falha na consulta
          </span>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <Button
          onClick={onRetry}
          disabled={retrying}
          className="min-w-48 gap-2"
        >
          <RefreshCw
            className={cn("size-4", retrying && "motion-safe:animate-spin")}
          />
          {retrying ? "Tentando novamente…" : "Tentar novamente"}
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Se o problema continuar, aguarde alguns instantes antes de tentar
          outra vez.
        </p>
      </CardContent>
    </Card>
  );
}
