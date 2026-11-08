"use client";
import { useSession } from "next-auth/react";
import { invalidateQuery } from "@/lib/tanstack-query/methods";
import { ChangePlanButton, PlanChangeNotice } from "./plan-change";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CreditCard, RefreshCw, ShieldCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { useSubscription } from "@/domains/billing/use-subscription";
import {
  createSubscriptionCheckout,
  cancelSubscription,
  syncSubscription,
} from "@/domains/billing/actions";
import { checkoutUrlSchema } from "@/domains/billing/subscription-types";
import type { SubscriptionPlan } from "@/domains/billing/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { formatDate } from "@/utils/date";
const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100
  );
const labels: Record<string, string> = {
  CREATING: "Preparando pagamento",
  WAITING: "Aguardando pagamento",
  REVIEW_REQUIRED: "Aguardando confirmação do Asaas",
  ACTIVE: "Renovação mensal ativa",
  INACTIVE: "Renovação suspensa no Asaas",
  PAST_DUE: "Pagamento pendente",
  CANCELLED: "Renovação cancelada",
  EXPIRED: "Checkout expirado",
  FAILED: "Contratação não concluída",
};
export function SubscriptionBillingStatus() {
  const query = useSubscription();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const revision = query.data
    ? `${query.data.subscription?.planCode}:${query.data.subscription?.status}:${query.data.subscription?.currentPeriodEnd}:${query.data.subscription?.effectivePlanName}:${query.data.planChange?.id}:${query.data.planChange?.status}`
    : "";
  useEffect(() => {
    if (revision && userId)
      void invalidateQuery(queryKeys.billing.access(userId));
  }, [revision, userId]);
  const [confirm, setConfirm] = useState(false);
  const cancelForm = useForm({ defaultValues: { password: "" } });
  const cancel = useServerAction({
    mutationFn: cancelSubscription,
    invalidateQueries: [queryKeys.billing.all],
    successMessage: "Renovação cancelada. Seu período pago será preservado.",
    onSuccess: () => {
      cancelForm.reset();
      setConfirm(false);
    },
  });
  const sync = useServerAction({
    mutationFn: syncSubscription,
    invalidateQueries: [queryKeys.billing.all],
    successMessage: "Assinatura atualizada.",
  });
  if (query.isPending) return <Skeleton className="h-40 rounded-2xl" />;
  if (query.isError)
    return (
      <ApiErrorCard
        title="Não foi possível consultar a cobrança"
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const data = query.data,
    row = data?.subscription;
  const pending = cancel.isPending || sync.isPending;
  return (
    <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="size-5" />
            Assinatura mensal
          </CardTitle>
          <Badge variant="outline">
            {data?.environment === "sandbox"
              ? "Ambiente de teste · sem cobrança real"
              : "Pagamento seguro pelo Asaas"}
          </Badge>
        </div>
        <CardDescription>
          Renovação automática no cartão de crédito. Os dados do cartão são
          preenchidos somente no Asaas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data?.enabled && (
          <p className="text-muted-foreground text-sm">
            O pagamento está sendo configurado. Seus dados e prazo de acesso
            estão preservados.
          </p>
        )}
        {row ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.planName} · {money(row.priceCents)}/mês
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {labels[row.status] || "Em atualização"}
                </p>
              </div>
              {row.status === "ACTIVE" && (
                <ShieldCheck className="text-primary size-7" />
              )}
            </div>
            {row.effectivePlanName &&
              row.effectivePlanName !== row.planName && (
                <p className="text-sm">
                  Limites em uso neste período:{" "}
                  <strong>{row.effectivePlanName}</strong>.
                </p>
              )}
            <PlanChangeNotice />
            {row.currentPeriodEnd && (
              <p className="text-sm">
                Período pago até{" "}
                <strong>
                  {formatDate(row.currentPeriodEnd, "dd/MM/yyyy HH:mm")}
                </strong>
                .
              </p>
            )}
            {row.status === "REVIEW_REQUIRED" && (
              <p className="text-muted-foreground text-sm">
                Não foi possível confirmar a criação do checkout. Isso não indica
                que o pagamento foi realizado. O suporte precisa conferir a
                tentativa no Asaas antes de liberar uma nova contratação.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {row.checkoutUrl && (
                <Button asChild>
                  <a href={row.checkoutUrl} rel="noreferrer">
                    Continuar no Asaas
                  </a>
                </Button>
              )}
              {row.invoiceUrl && (
                <Button asChild>
                  <a
                    href={row.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir fatura no Asaas
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                disabled={pending || !data.enabled}
                onClick={() => sync.mutate(row.id)}
              >
                <RefreshCw
                  className={sync.isPending ? "size-4 animate-spin" : "size-4"}
                />
                Já paguei / atualizar
              </Button>
              {!["CANCELLED", "EXPIRED", "FAILED"].includes(row.status) && (
                <Button
                  variant="ghost"
                  disabled={pending || !data.enabled}
                  onClick={() => setConfirm(true)}
                >
                  Cancelar{" "}
                  {row.status === "ACTIVE" || row.status === "PAST_DUE"
                    ? "renovação"
                    : "contratação"}
                </Button>
              )}
            </div>
            {row.status === "CANCELLED" && (
              <p className="text-muted-foreground text-xs">
                Não haverá novas cobranças desta assinatura. O acesso pago
                continua até o fim do período confirmado.
              </p>
            )}
            <AlertDialog
              open={confirm}
              onOpenChange={(open) => {
                if (cancel.isPending) return;
                if (!open) cancelForm.reset();
                setConfirm(open);
              }}
            >
              <AlertDialogContent>
                <form
                  className="space-y-5"
                  onSubmit={cancelForm.handleSubmit(({ password }) =>
                    cancel.mutate({ id: row.id, password })
                  )}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar a renovação?</AlertDialogTitle>
                    <AlertDialogDescription>
                      As próximas cobranças desta assinatura serão
                      interrompidas. O período já pago continua disponível.
                      Cancelar não solicita estorno.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <ControlledInput
                    control={cancelForm.control}
                    name="password"
                    label="Confirme sua senha"
                    placeholder="Senha da sua conta PromoFlow"
                    type="password"
                    autoComplete="current-password"
                    maxLength={128}
                    disabled={cancel.isPending}
                    rules={{ required: "Informe sua senha para confirmar." }}
                  />
                  {cancel.error && (
                    <p role="alert" className="text-destructive text-sm">
                      {cancel.error.message}
                    </p>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      type="button"
                      disabled={cancel.isPending}
                    >
                      Voltar
                    </AlertDialogCancel>
                    <Button
                      variant="destructive"
                      type="submit"
                      disabled={cancel.isPending}
                    >
                      {cancel.isPending
                        ? "Cancelando…"
                        : "Confirmar cancelamento"}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Escolha um plano abaixo. Seu teste não gera uma assinatura
            automaticamente.
          </p>
        )}
        {(sync.error || cancel.error) && (
          <p role="alert" className="text-destructive text-sm">
            {sync.error?.message || cancel.error?.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
export function SubscribeButton({ plan }: { plan: SubscriptionPlan }) {
  const query = useSubscription();
  const [open, setOpen] = useState(false);
  const form = useForm({ defaultValues: { acceptRecurring: false } });
  const checkout = useServerAction({
    mutationFn: createSubscriptionCheckout,
    invalidateQueries: [queryKeys.billing.all],
    disableSuccessToast: true,
    onSuccess: (response) => {
      const target = response.data.subscription?.checkoutUrl;
      setOpen(false);
      if (target) {
        const result = checkoutUrlSchema.safeParse(target);
        if (result.success) window.location.assign(result.data);
      }
    },
  });
  const row = query.data?.subscription;
  const hasOpen =
    !!row && !["CANCELLED", "EXPIRED", "FAILED"].includes(row.status);
  if (
    row?.status === "ACTIVE" &&
    !row.cancelledAt &&
    plan.code !== row.planCode
  )
    return <ChangePlanButton subscriptionId={row.id} planCode={plan.code} />;
  return (
    <>
      <Button
        className="w-full"
        disabled={!query.data?.enabled || hasOpen || checkout.isPending}
        onClick={() => {
          form.reset();
          setOpen(true);
        }}
      >
        {!query.data?.enabled
          ? "Pagamento em configuração"
          : hasOpen
            ? ["CREATING", "WAITING", "REVIEW_REQUIRED"].includes(row.status)
              ? row.planCode === plan.code
                ? "Contratação pendente"
                : "Aguarde a contratação pendente"
              : row.planCode === plan.code
                ? "Seu plano selecionado"
                : "Cancele a renovação para trocar"
            : "Assinar mensalmente"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinar {plan.name}</DialogTitle>
            <DialogDescription>
              {money(plan.monthlyPriceCents)} por mês, com renovação automática
              no cartão de crédito.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((data) => {
              if (
                data.acceptRecurring &&
                (plan.code === "ESSENTIAL" || plan.code === "PROFESSIONAL")
              )
                checkout.mutate({
                  planCode: plan.code,
                  requestId: crypto.randomUUID(),
                  acceptRecurring: true,
                });
            })}
          >
            <p className="text-muted-foreground text-sm">
              A primeira mensalidade será cobrada ao concluir a assinatura,
              mesmo que seu teste ainda esteja ativo. As próximas cobranças são
              mensais. Você pode cancelar a renovação nesta tela. O acesso pago
              será confirmado pelo Asaas.
            </p>
            {query.data?.environment === "sandbox" && (
              <Badge variant="outline">
                Sandbox: utilize apenas dados e cartão de teste
              </Badge>
            )}
            <ControlledSingleCheckbox
              control={form.control}
              name="acceptRecurring"
              label="Concordo com a primeira cobrança imediata e a renovação mensal automática."
              rules={{
                validate: (value) =>
                  value || "Confirme a assinatura recorrente para continuar.",
              }}
              disabled={checkout.isPending}
            />
            {checkout.error && (
              <p role="alert" className="text-destructive text-sm">
                {checkout.error.message}
              </p>
            )}
            <Button
              className="w-full"
              disabled={checkout.isPending}
              type="submit"
            >
              {checkout.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Continuar no Asaas
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
