"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAccountAccess } from "@/domains/billing/use-account-access";
import { SubscriptionPanel } from "./subscription-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
export function AccountAccessBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = useAccountAccess();
  const pathname = usePathname();
  if (pathname === "/subscription") return children;
  if (access.isPending)
    return (
      <p className="text-muted-foreground">
        Consultando seu período de acesso…
      </p>
    );
  if (access.error)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível confirmar seu acesso.{" "}
          <Button variant="link" onClick={() => access.refetch()}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
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
