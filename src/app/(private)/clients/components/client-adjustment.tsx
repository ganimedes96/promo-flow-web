"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { CalendarClock, Coins, Send, SlidersHorizontal } from "lucide-react";
import { getClient } from "@/domains/clients/client";
import { adjustClientSubscription } from "@/domains/clients/actions";
import type { AdjustClientSubscription } from "@/domains/clients/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { formatDate } from "@/utils/date";

const currency = (cents: number) => (cents / 100).toFixed(2);

export function ClientAdjustment({ id }: { id: string }) {
  const { data: session } = useSession();
  const form = useForm({
    defaultValues: { dailyLimit: "", monthlyPrice: "", reason: "" },
  });
  const query = useQuery({
    queryKey: queryKeys.clients.detail(session?.user.id, id),
    queryFn: () => getClient(id),
    retry: false,
  });
  const mutation = useServerAction({
    mutationFn: adjustClientSubscription,
    invalidateQueries: [queryKeys.clients.all],
    successMessage: "Ajuste agendado para a próxima mensalidade.",
    onSuccess: () => void query.refetch(),
  });
  const current = query.data?.billing.find(
    (item) =>
      item.status === "ACTIVE" &&
      !!item.currentPeriodEnd &&
      new Date(item.currentPeriodEnd).getTime() > Date.now() &&
      !item.cancelledAt,
  );
  useEffect(() => {
    if (!current) return;
    form.reset({
      dailyLimit: String(
        current.nextMaxDailyPublications ?? current.effectiveDailyLimit,
      ),
      monthlyPrice: currency(
        current.nextCustomPriceCents ?? current.priceCents,
      ),
      reason: "",
    });
  }, [current, form]);

  const submit = (values: { dailyLimit: string; monthlyPrice: string; reason: string }) => {
    const amount = Number(values.monthlyPrice.replace(",", "."));
    const dailyLimit = Number(values.dailyLimit);
    const adjustment: AdjustClientSubscription = {
      dailyLimit,
      priceCents: Math.round(amount * 100),
      reason: values.reason.trim(),
    };
    mutation.mutate({ id, adjustment });
  };

  if (query.isPending)
    return <Skeleton className="h-80 w-full rounded-xl" />;
  if (query.isError || !query.data)
    return (
      <ApiErrorCard
        title="Não foi possível carregar a assinatura"
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  if (!current || !current.currentPeriodEnd)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura indisponível para ajuste</CardTitle>
          <CardDescription>
            Este cliente precisa ter uma assinatura mensal ativa no Asaas para
            alterar o limite e o valor da próxima fatura.
          </CardDescription>
        </CardHeader>
      </Card>
    );

  const pending = current.nextCustomEffectiveAt;
  return (
    <div className="space-y-4">
      <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="text-primary size-5" />
            Ajuste individual da assinatura
          </CardTitle>
          <CardDescription>
            Defina um limite personalizado e o valor mensal deste cliente. O
            ajuste entra em vigor no próximo ciclo pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-background/70 rounded-lg border p-3">
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Send className="size-3.5" /> Limite atual
              </p>
              <p className="mt-1 text-lg font-semibold">
                {current.effectiveDailyLimit} publicações/dia
              </p>
            </div>
            <div className="bg-background/70 rounded-lg border p-3">
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Coins className="size-3.5" /> Mensalidade atual
              </p>
              <p className="mt-1 text-lg font-semibold">
                {(current.priceCents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {pending && (
        <div className="border-primary/40 bg-primary/10 rounded-lg border p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <CalendarClock className="size-4" /> Ajuste já programado
          </p>
          <p className="text-muted-foreground mt-1">
            {current.nextMaxDailyPublications} publicações/dia por{" "}
            {((current.nextCustomPriceCents ?? 0) / 100).toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" },
            )} por mês, previsto para {formatDate(pending, "dd/MM/yyyy")}.
          </p>
        </div>
      )}
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => submit(values))}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ControlledInput
            control={form.control}
            name="dailyLimit"
            label="Publicações por dia"
            placeholder="400"
            type="number"
            min={1}
            max={10000}
            disabled={mutation.isPending || !!pending}
            rules={{
              validate: (value) =>
                (Number.isInteger(Number(value)) &&
                  Number(value) >= 1 &&
                  Number(value) <= 10000) ||
                "Informe um limite entre 1 e 10.000.",
            }}
          />
          <ControlledInput
            control={form.control}
            name="monthlyPrice"
            label="Nova mensalidade (R$)"
            placeholder="79,90"
            type="number"
            min={1}
            max={10000}
            step="0.01"
            disabled={mutation.isPending || !!pending}
            rules={{
              validate: (value) =>
                (Number.isFinite(Number(value.replace(",", "."))) &&
                  Number(value.replace(",", ".")) >= 1 &&
                  Number(value.replace(",", ".")) <= 10000) ||
                "Informe um valor entre R$ 1,00 e R$ 10.000,00.",
            }}
          />
        </div>
        <ControlledInput
          control={form.control}
          name="reason"
          label="Motivo do ajuste"
          placeholder="Ex.: limite personalizado solicitado pelo cliente"
          maxLength={300}
          disabled={mutation.isPending || !!pending}
          rules={{ required: "Informe o motivo do ajuste." }}
        />
        <div className="bg-muted/50 rounded-lg border p-3 text-sm">
          <p className="font-medium">Próxima cobrança prevista</p>
          <p className="text-muted-foreground mt-1">
            {formatDate(current.currentPeriodEnd, "dd/MM/yyyy")}. Cobranças já
            emitidas não serão alteradas. O limite novo só será liberado após a
            confirmação do pagamento do próximo ciclo.
          </p>
        </div>
        <Button type="submit" disabled={mutation.isPending || !!pending}>
          {mutation.isPending ? "Agendando ajuste…" : "Agendar para próxima fatura"}
        </Button>
      </form>
      {mutation.error && (
        <p role="alert" className="text-destructive text-sm">
          {mutation.error.message}
        </p>
      )}
    </div>
  );
}
