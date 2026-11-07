"use client";
import { useState } from "react";
import { useSubscription } from "@/domains/billing/use-subscription";
import { SubscriptionPlans } from "./subscription-plans";
import { SubscriptionPayments } from "./subscription-payments";
import { SubscriptionAdjustmentNotice } from "./subscription-adjustment-notice";
import Link from "next/link";
import { SubscriptionBillingStatus } from "./subscription-checkout";
import {
  CreditCard,
  ChevronDown,
  AlertCircle,
  MessageCircle,
  Users,
  Radio,
  Store,
  Send,
} from "lucide-react";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import {
  PlansSkeleton,
  SubscriptionSkeleton,
} from "@/components/feedback/loading-skeletons";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getSubscriptionPlans } from "@/domains/billing/client";
import { useAccountAccess } from "@/domains/billing/use-account-access";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { formatDate } from "@/utils/date";
export function SubscriptionPanel() {
  const access = useAccountAccess();
  const beta = access.data?.billingMode === "BETA";
  const billing = useSubscription(!!access.data && !beta);
  const [plansExpanded, setPlansExpanded] = useState<boolean | null>(null);
  const showPlans = plansExpanded ?? access.data?.status !== "ACTIVE";
  const outstanding = (billing.data?.payments ?? [])
    .filter((payment) => ["PENDING", "OVERDUE"].includes(payment.status))
    .sort(
      (a, b) =>
        Number(b.status === "OVERDUE") - Number(a.status === "OVERDUE") ||
        a.dueDate.localeCompare(b.dueDate)
    );
  const payment = outstanding[0];
  const overdue =
    payment?.status === "OVERDUE" ||
    billing.data?.subscription?.status === "PAST_DUE";
  const plans = useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: getSubscriptionPlans,
    enabled: !!access.data && !beta,
  });
  if (access.isPending) return <SubscriptionSkeleton />;
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {!beta && billing.data?.subscription?.customAdjustment && (
        <SubscriptionAdjustmentNotice
          subscription={billing.data.subscription}
          plan={access.data?.plan}
        />
      )}
      <Card className="from-primary/10 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <Badge variant="outline">
            {beta
              ? access.data?.canUseApp
                ? "Acesso beta"
                : "Acesso beta encerrado"
              : access.data?.status === "ACTIVE"
                ? "Assinatura ativa"
                : access.data?.status === "EXPIRED"
                  ? "Teste encerrado"
                  : "Período de teste gratuito"}
          </Badge>
          <CardTitle className="text-2xl">
            {access.data?.plan?.name || "Seu plano no PromoFlow"}
          </CardTitle>
          <CardDescription>
            {beta
              ? access.data?.canUseApp
                ? "Seu acesso beta inclui os recursos e limites abaixo. Nenhuma cobrança será feita durante este período."
                : "Seu acesso beta terminou. Entre em contato com o administrador para solicitar uma extensão."
              : access.data?.status === "EXPIRED"
                ? "Seu período de teste terminou. Seus dados e histórico estão preservados. Novas operações ficam pausadas até a ativação de uma assinatura."
                : "Acompanhe seu acesso e conheça os planos disponíveis."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {access.data && (
            <p className="text-muted-foreground text-sm">
              {access.data.status === "ACTIVE" &&
              access.data.subscriptionActiveUntil
                ? `Acesso ativo até ${formatDate(access.data.subscriptionActiveUntil, "dd/MM/yyyy HH:mm")}.`
                : `Teste gratuito até ${formatDate(access.data.trialEndsAt, "dd/MM/yyyy HH:mm")}.`}
            </p>
          )}
          {access.error && (
            <Alert variant="destructive">
              <AlertDescription>{access.error.message}</AlertDescription>
            </Alert>
          )}
          {!beta && (payment || overdue) && (
            <div
              role="status"
              className={`motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${overdue ? "border-destructive/40 bg-destructive/10" : "border-amber-500/35 bg-amber-500/10"}`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`mt-0.5 size-5 shrink-0 ${overdue ? "text-destructive" : "text-amber-600 dark:text-amber-300"}`}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {overdue
                      ? "Você tem uma cobrança vencida"
                      : "Cobrança aguardando pagamento"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {payment
                      ? `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment.valueCents / 100)} · Vencimento: ${formatDate(payment.dueDate + "T12:00:00-03:00")}.`
                      : "Confira a situação da cobrança no Asaas para regularizar sua assinatura."}
                  </p>
                  {outstanding.length > 1 && (
                    <p className="text-muted-foreground text-xs">
                      {outstanding.length} cobranças pendentes no histórico.
                    </p>
                  )}
                  {billing.data?.environment === "sandbox" && (
                    <p className="text-muted-foreground text-xs">
                      Ambiente de teste: esta cobrança não representa um
                      pagamento real.
                    </p>
                  )}
                </div>
              </div>
              <Button
                asChild
                variant={overdue ? "destructive" : "outline"}
                className="shrink-0"
              >
                {payment?.invoiceUrl ? (
                  <a
                    href={payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver fatura
                  </a>
                ) : (
                  <a href="#subscription-payments">Ver cobranças</a>
                )}
              </Button>
            </div>
          )}
          {access.data?.plan && access.data.usage && (
            <div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
              aria-label="Uso dos limites do plano"
            >
              {[
                {
                  label: "Conexões WhatsApp",
                  icon: MessageCircle,
                  used: access.data.usage.connections,
                  limit: access.data.plan.maxConnections,
                },
                {
                  label: "Grupos de destino",
                  icon: Users,
                  used: access.data.usage.groups,
                  limit: access.data.plan.maxGroups,
                },
                {
                  label: "Origens espelhadas",
                  icon: Radio,
                  used: access.data.usage.mirroredGroups,
                  limit: access.data.plan.maxMirroredGroups,
                },
                {
                  label: "Lojas configuradas",
                  icon: Store,
                  used: access.data.usage.stores,
                  limit: access.data.plan.maxStores,
                },
                {
                  label: "Publicações hoje",
                  icon: Send,
                  used: access.data.usage.publications,
                  limit: access.data.plan.maxDailyPublications,
                },
              ].map((item, index) => {
                const ratio = item.limit > 0 ? item.used / item.limit : 0;
                const full = item.limit > 0 && ratio >= 1;
                const warning = !full && ratio >= 0.8;
                const tone = full
                  ? "text-destructive"
                  : warning
                    ? "text-amber-600 dark:text-amber-300"
                    : "text-primary";
                const bar = full
                  ? "bg-destructive"
                  : warning
                    ? "bg-amber-500"
                    : "bg-primary";
                return (
                  <div
                    key={item.label}
                    style={{ animationDelay: `${index * 75}ms` }}
                    className="group/limit from-primary/5 via-card to-card hover:border-primary/50 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:shadow-lg motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
                  >
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span
                        className={`bg-primary/10 inline-flex size-9 items-center justify-center rounded-xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/limit:scale-110 motion-safe:group-hover/limit:-rotate-6 ${tone}`}
                      >
                        <item.icon className="size-4" />
                      </span>
                      <span className={`text-[10px] font-medium ${tone}`}>
                        {item.limit === 0
                          ? "Não incluído"
                          : full
                            ? "Limite atingido"
                            : warning
                              ? "Quase no limite"
                              : "Disponível"}
                      </span>
                    </div>
                    <p className="text-muted-foreground min-h-10 text-xs leading-5 font-medium">
                      {item.label}
                    </p>
                    <p className="mt-1 flex items-baseline gap-1.5 tabular-nums">
                      <strong className="text-2xl tracking-tight">
                        {item.used}
                      </strong>
                      <span className="text-muted-foreground text-xs">
                        / {item.limit}
                      </span>
                    </p>
                    <div
                      role="progressbar"
                      aria-label={item.label}
                      aria-valuemin={0}
                      aria-valuemax={item.limit || 1}
                      aria-valuenow={Math.min(item.used, item.limit || 1)}
                      aria-valuetext={`${item.used} utilizados de ${item.limit}`}
                      className="bg-primary/10 mt-4 h-1.5 overflow-hidden rounded-full"
                    >
                      <div
                        className={`motion-safe:animate-in motion-safe:fade-in h-full origin-left rounded-full motion-safe:transition-[width] motion-safe:duration-700 ${bar}`}
                        style={{
                          width: `${Math.min(100, Math.max(0, ratio * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-[10px]">
                      {item.label === "Publicações hoje"
                        ? "Renova diariamente"
                        : item.limit === 0
                          ? "Indisponível neste plano"
                          : item.used > item.limit
                            ? `${item.used - item.limit} acima do limite`
                            : `${Math.max(0, item.limit - item.used)} livres no plano`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            Cada envio para um grupo consome uma publicação. Envios sem
            confirmação reservam a cota; falhas confirmadas liberam a reserva.
            Renovação diária à meia-noite de São Paulo.
          </p>
          {access.data?.canUseApp && (
            <Button asChild variant="outline">
              <Link href="/control-panel">Voltar ao painel</Link>
            </Button>
          )}
        </CardContent>
      </Card>
      {!beta && (
        <>
          <SubscriptionBillingStatus />
          <div>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {access.data?.status === "ACTIVE"
                    ? "Seu plano, no seu ritmo"
                    : "Escolha o próximo passo do seu negócio"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {showPlans
                    ? "Compare os limites. A troca só acontece após sua confirmação."
                    : "Seu plano está ativo. Abra as opções quando quiser comparar ou mudar."}
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                aria-expanded={showPlans}
                aria-controls="subscription-plan-options"
                onClick={() => setPlansExpanded(!showPlans)}
              >
                {showPlans ? "Recolher planos" : "Alterar plano"}
                <ChevronDown
                  className={`size-4 motion-safe:transition-transform motion-safe:duration-300 ${showPlans ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
            <div
              id="subscription-plan-options"
              aria-hidden={!showPlans}
              inert={!showPlans}
              className={`grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-300 ${showPlans ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="p-1.5">
                  {plans.isPending ? (
                    <PlansSkeleton />
                  ) : plans.error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{plans.error.message}</AlertDescription>
                    </Alert>
                  ) : !plans.data?.length ? (
                    <EmptyStateCard
                      icon={CreditCard}
                      title="Os planos estão sendo preparados"
                      description="Os valores e a forma de pagamento serão disponibilizados aqui. Nenhuma cobrança é feita automaticamente."
                      action={
                        <Button
                          variant="outline"
                          disabled={plans.isFetching}
                          onClick={() => {
                            void plans.refetch();
                          }}
                        >
                          Atualizar planos
                        </Button>
                      }
                    />
                  ) : (
                    <SubscriptionPlans plans={plans.data} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <SubscriptionPayments />
        </>
      )}
    </div>
  );
}
