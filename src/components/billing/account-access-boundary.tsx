"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAccountAccess } from "@/domains/billing/use-account-access";
import { SubscriptionPanel } from "./subscription-panel";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { Button } from "@/components/ui/button";
export function AccountAccessBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = useAccountAccess();
  const pathname = usePathname();
  if (pathname === "/subscription" || pathname === "/extension")
    return children;
  if (access.isPending)
    return (
      <p className="text-muted-foreground">
        Consultando seu período de acesso…
      </p>
    );
  if (access.error)
    return (
      <div className="flex min-h-[55vh] items-center justify-center py-8">
        <ApiErrorCard
          title="Não foi possível confirmar seu acesso"
          description="Não conseguimos consultar sua conta neste momento. Tente novamente para continuar no PromoFlow."
          onRetry={() => {
            void access.refetch();
          }}
          retrying={access.isFetching}
        />
      </div>
    );
  if (!access.data?.canUseApp) return <SubscriptionPanel />;
  return (
    <>
      {access.data.status === "TRIALING" && (
        <div className="bg-primary/10 border-primary/25 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <p className="text-sm">
            Teste gratuito:{" "}
            <strong>{access.data.daysRemaining} dia(s) restante(s)</strong>.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/subscription">Ver assinatura</Link>
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
