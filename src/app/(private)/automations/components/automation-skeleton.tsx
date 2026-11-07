import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export function AutomationSkeleton() {
  return (
    <div className="space-y-5" role="status">
      <span className="sr-only">Carregando configurações de automação</span>
      <div aria-hidden="true" className="grid gap-5 lg:grid-cols-2">
        {[
          { id: "mode", layout: "lg:col-span-2", height: "h-16" },
          { id: "destinations", layout: "", height: "h-28" },
          { id: "filters", layout: "", height: "h-28" },
          { id: "schedule", layout: "lg:col-span-2", height: "h-36" },
        ].map(({ id, layout, height }) => (
          <Card key={id} className={layout}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-3/4 max-w-sm" />
            </CardHeader>
            <CardContent>
              <Skeleton className={height} />
            </CardContent>
          </Card>
        ))}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
