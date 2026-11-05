"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { SupportReference } from "@/components/feedback/activity-history";
import { getActivityReference } from "@/domains/activity/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^PF-[a-f0-9]{20}$/i, "Cole o código de atendimento completo."),
});
export function ActivityReferenceLookup() {
  const { data: session } = useSession();
  const [code, setCode] = useState("");
  const form = useForm({ defaultValues: { code: "" } });
  const query = useQuery({
    queryKey: queryKeys.activity.reference(session?.user.id, code),
    queryFn: () => getActivityReference(code),
    enabled: !!code && !!session?.user.id,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return (
    <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-5" />
          Consultar código de atendimento
        </CardTitle>
        <CardDescription>
          Localize a ocorrência informada pelo cliente, com o contexto e os
          detalhes técnicos disponíveis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={form.handleSubmit((values) => {
            const next = values.code.trim().toUpperCase();
            if (next === code) void query.refetch();
            else setCode(next);
          })}
        >
          <div className="min-w-64 flex-1">
            <ControlledInput
              control={form.control}
              name="code"
              label="Código de atendimento"
              placeholder="PF-…"
              maxLength={24}
              rules={{
                validate: (value) =>
                  schema.shape.code.safeParse(value).success ||
                  "Cole o código de atendimento completo.",
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={query.isFetching}
            loading={query.isFetching}
          >
            <Search className="size-4" />
            Consultar
          </Button>
        </form>
        {code && query.isError && (
          <ApiErrorCard
            title="Não foi possível consultar a ocorrência"
            error={query.error}
            onRetry={() => void query.refetch()}
            retrying={query.isFetching}
          />
        )}
        {code && query.isSuccess && !query.data && (
          <EmptyStateCard
            variant="search"
            title="Código não encontrado"
            description="Confira se o cliente copiou o código completo."
          />
        )}
        {query.data && (
          <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
            <p className="font-semibold">
              {query.data.user.name} · {query.data.user.email}
            </p>
            <p className="text-sm">{query.data.message}</p>
            <SupportReference event={query.data} />
            <p className="text-muted-foreground text-xs break-all">
              {query.data.kind === "CONNECTION"
                ? "Conexão: " + query.data.connectionId
                : "Oferta: " + query.data.offerId}{" "}
              · Status: {query.data.status}
            </p>
            {query.data.technicalDetails && (
              <details>
                <summary className="cursor-pointer text-sm font-medium">
                  Detalhes técnicos · somente administração
                </summary>
                <pre className="bg-background/60 mt-2 max-h-60 overflow-auto rounded-lg p-3 text-xs break-words whitespace-pre-wrap">
                  {query.data.technicalDetails}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
