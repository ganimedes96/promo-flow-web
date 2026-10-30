"use client";
import Link from "next/link";
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
  const plans = useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: getSubscriptionPlans,
  });
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <Badge variant="outline">
            {access.data?.status === "ACTIVE"
              ? "Assinatura ativa"
              : access.data?.status === "EXPIRED"
                ? "Teste encerrado"
                : "10 dias para experimentar"}
          </Badge>
          <CardTitle className="text-2xl">Seu plano no PromoFlow</CardTitle>
          <CardDescription>
            {access.data?.status === "EXPIRED"
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
          {access.isPending && <p>Consultando seu acesso…</p>}
          {access.error && (
            <Alert variant="destructive">
              <AlertDescription>{access.error.message}</AlertDescription>
            </Alert>
          )}
          {access.data?.canUseApp && (
            <Button asChild variant="outline">
              <Link href="/control-panel">Voltar ao painel</Link>
            </Button>
          )}
        </CardContent>
      </Card>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Planos de assinatura</h2>
        {plans.isPending ? (
          <p>Carregando planos…</p>
        ) : plans.error ? (
          <Alert variant="destructive">
            <AlertDescription>{plans.error.message}</AlertDescription>
          </Alert>
        ) : !plans.data?.length ? (
          <Card>
            <CardContent className="space-y-2">
              <h3 className="font-semibold">
                Os planos estão sendo preparados.
              </h3>
              <p className="text-muted-foreground text-sm">
                Os valores e a forma de pagamento serão disponibilizados aqui.
                Nenhuma cobrança é feita automaticamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.data.map((plan) => (
              <Card key={plan.code}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(plan.monthlyPriceCents / 100)}
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      / mês
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Até {plan.maxGroups} grupos • {plan.maxConnections}{" "}
                    conexão(ões)
                  </p>
                  <Button disabled className="w-full">
                    Pagamento em configuração
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
