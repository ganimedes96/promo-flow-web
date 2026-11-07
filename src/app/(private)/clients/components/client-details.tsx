"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Clock3, ShieldCheck } from "lucide-react";
import { getClient } from "@/domains/clients/client";
import { changeClientAccess } from "@/domains/clients/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/utils/date";
import { ClientBillingHistory } from "./client-billing-history";
import { ClientStatus } from "./client-status";
const date = (value: string) => formatDate(value, "dd/MM/yyyy HH:mm");
export function ClientDetails({ id }: { id: string }) {
  const { data: session } = useSession();
  const [confirm, setConfirm] = useState(false);
  const form = useForm({ defaultValues: { days: "1", reason: "" } });
  const query = useQuery({
    queryKey: queryKeys.clients.detail(session?.user.id, id),
    queryFn: () => getClient(id),
    retry: false,
  });
  const update = useServerAction({
    mutationFn: changeClientAccess,
    invalidateQueries: [queryKeys.clients.all],
    successMessage: "Cliente atualizado.",
    onSuccess: () => {
      setConfirm(false);
      form.resetField("reason");
    },
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  if (query.isError || !query.data)
    return (
      <ApiErrorCard
        title="Não foi possível consultar o cliente"
        description={
          query.error instanceof Error
            ? query.error.message
            : "Não foi possível carregar os dados deste cliente. Tente novamente."
        }
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const { client, history, billing } = query.data;
  const busy = update.isPending || query.isFetching;
  const base = () => ({
    requestId: crypto.randomUUID(),
    expectedUpdatedAt: client.updatedAt,
    reason: form.getValues("reason"),
  });
  const extend = (days: number) =>
    update.mutate({ id, change: { ...base(), action: "EXTEND_TRIAL", days } });
  return (
    <div className="space-y-5">
      <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <ClientStatus client={client} />
          </div>
          <CardDescription>{client.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Telefone: {client.phone || "Não informado"}</p>
          <p>Cadastro: {date(client.createdAt)}</p>
          <p>
            Fim do teste: <strong>{date(client.trialEndsAt)}</strong>
          </p>
          {client.isDisabled && (
            <p className="text-destructive text-xs">
              A conta está desativada. Ampliar o teste não a reativa.
            </p>
          )}
        </CardContent>
      </Card>
      <ClientBillingHistory billing={billing} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock3 className="size-4" />
            Ampliar teste gratuito
          </CardTitle>
          <CardDescription>
            Acrescente dias ao prazo atual. Se o teste já encerrou, os novos
            dias contam a partir de agora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ControlledInput
            control={form.control}
            name="reason"
            label="Observação administrativa (opcional)"
            placeholder="Ex.: cortesia de suporte"
            maxLength={300}
            disabled={busy}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => extend(1)}
          >
            <Plus className="size-4" />
            Mais 1 dia
          </Button>
          <form
            className="grid items-end gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={form.handleSubmit((values) =>
              extend(Number(values.days))
            )}
          >
            <ControlledInput
              control={form.control}
              name="days"
              label="Quantidade de dias"
              placeholder="1"
              type="number"
              min={1}
              max={365}
              disabled={busy}
              rules={{
                validate: (value) =>
                  (Number.isInteger(Number(value)) &&
                    Number(value) >= 1 &&
                    Number(value) <= 365) ||
                  "Informe de 1 a 365 dias.",
              }}
            />
            <Button type="submit" disabled={busy}>
              Adicionar dias
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" />
            Acesso à conta
          </CardTitle>
          <CardDescription>
            Desativar preserva os dados e bloqueia novos acessos, capturas e
            reservas de publicação. Um envio já iniciado pode terminar. Reativar
            não altera o prazo do teste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant={client.isDisabled ? "outline" : "destructive"}
            disabled={busy}
            onClick={() => setConfirm(true)}
          >
            {client.isDisabled ? "Reativar conta" : "Desativar conta"}
          </Button>
        </CardContent>
      </Card>
      {update.error && (
        <p role="alert" className="text-destructive text-sm">
          {update.error.message}
        </p>
      )}
      <div>
        <h3 className="mb-3 font-semibold">Últimas alterações</h3>
        {history.length ? (
          <ol className="space-y-3">
            {history.map((item) => (
              <li
                key={item.id}
                className="bg-card rounded-xl border p-4 text-xs"
              >
                <p className="font-semibold">
                  {item.action === "EXTEND_TRIAL"
                    ? "Teste ampliado"
                    : item.action === "ADJUST_SUBSCRIPTION"
                      ? "Ajuste individual de assinatura"
                      : typeof item.after.isDisabled === "boolean"
                        ? item.after.isDisabled
                          ? "Conta desativada"
                          : "Conta reativada"
                        : "Acesso atualizado"}
                </p>
                <p className="text-muted-foreground mt-1">
                  {date(item.createdAt)}
                </p>
                {item.action === "EXTEND_TRIAL" && (
                  <p className="mt-2">
                    {item.before.trialEndsAt && item.after.trialEndsAt
                      ? `De ${date(item.before.trialEndsAt)} para ${date(item.after.trialEndsAt)}`
                      : "Os prazos deste registro antigo não estão disponíveis."}
                  </p>
                )}
                {item.action === "ADJUST_SUBSCRIPTION" && (
                  <p className="mt-2">
                    {item.before.limits?.maxDailyPublications} → {item.after.limits?.maxDailyPublications} publicações/dia ·{" "}
                    {item.before.priceCents !== undefined &&
                      (item.before.priceCents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}{" "}
                    →{" "}
                    {item.after.priceCents !== undefined &&
                      (item.after.priceCents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    {item.after.effectiveAt &&
                      ` · previsto para ${date(item.after.effectiveAt)}`}
                    {item.after.status === "FAILED" && " · falhou no Asaas"}
                  </p>
                )}
                {item.action === "ADJUST_SUBSCRIPTION" && item.after.limits && (
                  <p className="text-muted-foreground mt-1">
                    {[
                      ["Grupos", item.before.limits?.maxGroups, item.after.limits.maxGroups],
                      ["Conexões", item.before.limits?.maxConnections, item.after.limits.maxConnections],
                      ["Espelhados", item.before.limits?.maxMirroredGroups, item.after.limits.maxMirroredGroups],
                      ["Lojas", item.before.limits?.maxStores, item.after.limits.maxStores],
                      ["Marca d’água", item.before.limits?.watermarkEnabled ? "sim" : "não", item.after.limits.watermarkEnabled ? "sim" : "não"],
                    ]
                      .filter(([, before, after]) => before !== after)
                      .map(([label, before, after]) => `${label}: ${before} → ${after}`)
                      .join(" · ")}
                  </p>
                )}
                {item.reason && (
                  <p className="mt-2 break-words">{item.reason}</p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-sm">
            Nenhuma alteração administrativa registrada.
          </p>
        )}
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {client.isDisabled ? "Reativar" : "Desativar"} a conta de{" "}
              {client.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {client.isDisabled
                ? "O cliente poderá acessar novamente se ainda tiver um período de acesso válido."
                : "Novos acessos e operações deste cliente serão bloqueados. Seus dados e histórico serão preservados."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={() =>
                update.mutate({
                  id,
                  change: {
                    ...base(),
                    action: "SET_ENABLED",
                    isEnabled: client.isDisabled,
                  },
                })
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
