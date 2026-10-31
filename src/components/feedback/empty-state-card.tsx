import type { ReactNode } from "react";
import { Inbox, Search, Sparkles, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/shadcn/utils";
import styles from "./empty-state-card.module.css";

type EmptyStateCardProps = {
  title: string;
  description: string;
  variant?: "empty" | "search";
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function EmptyStateCard({
  title,
  description,
  variant = "empty",
  icon,
  action,
  className,
}: EmptyStateCardProps) {
  const Icon = icon ?? (variant === "search" ? Search : Inbox);
  return (
    <Card
      role="status"
      className={cn(
        "bg-card relative isolate w-full overflow-hidden rounded-2xl border-dashed py-0 shadow-none",
        styles.card,
        className
      )}
    >
      <div aria-hidden="true" className={styles.texture} />
      <CardContent className="relative flex min-h-72 flex-col items-center justify-center px-5 py-10 text-center sm:px-8">
        <div
          aria-hidden="true"
          className="relative mb-5 flex size-24 items-center justify-center"
        >
          <span
            className={cn(
              "border-primary/25 absolute inset-0 rounded-full border border-dashed",
              styles.orbit
            )}
          />
          <span className="bg-primary/5 absolute inset-2 rounded-full" />
          <span
            className={cn(
              "border-primary/20 bg-primary/10 text-primary relative flex size-16 items-center justify-center rounded-2xl border shadow-sm",
              styles.icon
            )}
          >
            <Icon className="size-7" />
          </span>
          <span
            className={cn(
              "bg-background text-primary absolute -top-1 right-0 rounded-full border p-1.5",
              styles.sparkle
            )}
          >
            <Sparkles className="size-3.5" />
          </span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
          {description}
        </p>
        {action && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
