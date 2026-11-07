"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { CalendarClock, Coins, SlidersHorizontal } from "lucide-react";
import { getClient } from "@/domains/clients/client";
import { adjustClientSubscription } from "@/domains/clients/actions";
import type { AdjustClientSubscription } from "@/domains/clients/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledInputCurrency } from "@/components/form/controllers/controlled-input-currency";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
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

const limits = [
  ["maxGroups", "Grupos de destino", 10000],
  ["maxConnections", "Conexões WhatsApp", 1000],
  ["maxMirroredGroups", "Grupos espelhados", 10000],
  ["maxDailyPublications", "Publicações por dia", 100000],
  ["maxStores", "Lojas de afiliados", 1000],
] as const;

type FormValues = {
  maxGroups: string;
  maxConnections: string;
  maxMirroredGroups: string;
  maxDailyPublications: string;
  maxStores: string;
  watermarkEnabled: boolean;
  monthlyPrice: number | undefined;
  reason: string;
};

export function ClientAdjustment({ id }: { id: string }) {
  const { data: session } = useSession();
  const form = useForm<FormValues>({
    defaultValues: {
      maxGroups: "",
      maxConnections: "",
      maxMirroredGroups: "",
      maxDailyPublications: "",
      maxStores: "",
      watermarkEnabled: false,
      monthlyPrice: undefined,
      reason: "",
    },
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
    const next = {
      ...current.effectiveLimits,
      ...current.nextLimitsOverride,
    };
    form.reset({
      maxGroups: String(next.maxGroups),
      maxConnections: String(next.maxConnections),
      maxMirroredGroups: String(next.maxMirroredGroups),
      maxDailyPublications: String(next.maxDailyPublications),
      maxStores: String(next.maxStores),
      watermarkEnabled: next.watermarkEnabled,
      monthlyPrice: (current.nextCustomPriceCents ?? current.priceCents) / 100,
      reason: "",
    });
  }, [current, form]);

  const submit = (values: FormValues) => {
    const adjustment: AdjustClientSubscription = {
      maxGroups: Number(values.maxGroups),
      maxConnections: Number(values.maxConnections),
      maxMirroredGroups: Number(values.maxMirroredGroups),
      maxDailyPublications: Number(values.maxDailyPublications),
      maxStores: Number(values.maxStores),
      watermarkEnabled: values.watermarkEnabled,
      priceCents: Math.round((values.monthlyPrice ?? 0) * 100),
      reason: values.reason.trim(),
    };
    mutation.mutate({ id, adjustment });
  };

  if (query.isPending) return <Skeleton className="h-80 w-full rounded-xl" />;
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
            alterar limites e mensalidade.
          </CardDescription>
        </CardHeader>
      </Card>
    );

  const pending = current.nextCustomEffectiveAt;
  const pendingLimits = {
    ...current.effectiveLimits,
    ...current.nextLimitsOverride,
  };
  return (
    <div className="space-y-4">
      <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="text-primary size-5" />
            Ajuste individual da assinatura
          </CardTitle>
          <CardDescription>
            Personalize as cotas e os recursos deste cliente. A configuração
            entra em vigor após o pagamento do próximo ciclo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {limits.map(([key, label]) => (
            <div key={key} className="bg-background/70 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="mt-1 text-lg font-semibold">
                {current.effectiveLimits[key]}
              </p>
            </div>
          ))}
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
          <div className="bg-background/70 rounded-lg border p-3 sm:col-span-2">
            <p className="text-muted-foreground text-xs">Recurso de marca d’água</p>
            <p className="mt-1 font-semibold">
              {current.effectiveLimits.watermarkEnabled ? "Liberado" : "Desativado"}
            </p>
          </div>
        </CardContent>
      </Card>
      {pending && pendingLimits && (
        <div className="border-primary/40 bg-primary/10 rounded-lg border p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <CalendarClock className="size-4" /> Ajuste já programado
          </p>
          <p className="text-muted-foreground mt-1">
            Vigência prevista para {formatDate(pending, "dd/MM/yyyy")} ·{" "}
            {((current.nextCustomPriceCents ?? 0) / 100).toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" },
            )} por mês.
          </p>
          <ul className="text-muted-foreground mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {limits.map(([key, label]) => (
              <li key={key}>
                {label}: <strong>{pendingLimits[key]}</strong>
              </li>
            ))}
            <li>
              Marca d’água: <strong>{pendingLimits.watermarkEnabled ? "Liberada" : "Desativada"}</strong>
            </li>
          </ul>
        </div>
      )}
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(submit)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {limits.map(([key, label, max]) => (
            <ControlledInput
              key={key}
              control={form.control}
              name={key}
              label={label}
              placeholder="0"
              type="number"
              min={0}
              max={max}
              disabled={mutation.isPending || !!pending}
              rules={{
                validate: (value) =>
                  (Number.isInteger(Number(value)) &&
                    Number(value) >= 0 &&
                    Number(value) <= max) ||
                  `Informe um valor entre 0 e ${max}.`,
              }}
            />
          ))}
          <ControlledInputCurrency
            control={form.control}
            name="monthlyPrice"
            label="Nova mensalidade (R$)"
            placeholder="79,90"
            disabled={mutation.isPending || !!pending}
            rules={{
              validate: (value) =>
                (typeof value === "number" &&
                  Number.isFinite(value) &&
                  value >= 1 &&
                  value <= 10000) ||
                "Informe um valor entre R$ 1,00 e R$ 10.000,00.",
            }}
          />
        </div>
        <ControlledSwitch
          control={form.control}
          name="watermarkEnabled"
          label="Permitir marca d’água nas mensagens"
          description="Libera ou remove esse recurso apenas para este cliente."
          disabled={mutation.isPending || !!pending}
        />
        <ControlledInput
          control={form.control}
          name="reason"
          label="Motivo do ajuste"
          placeholder="Ex.: cotas adicionais solicitadas pelo cliente"
          maxLength={300}
          disabled={mutation.isPending || !!pending}
          rules={{ required: "Informe o motivo do ajuste." }}
        />
        <div className="bg-muted/50 rounded-lg border p-3 text-sm">
          <p className="font-medium">Próxima cobrança prevista</p>
          <p className="text-muted-foreground mt-1">
            {formatDate(current.currentPeriodEnd, "dd/MM/yyyy")}. Cobranças já
            emitidas não serão alteradas. Todas as cotas personalizadas só serão
            liberadas após a confirmação do pagamento do próximo ciclo.
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
