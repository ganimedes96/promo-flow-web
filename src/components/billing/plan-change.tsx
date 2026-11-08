"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useSubscription } from "@/domains/billing/use-subscription";
import {
  quotePlanChange,
  confirmPlanChange,
  cancelPlanChange,
} from "@/domains/billing/actions";
import {
  checkoutUrlSchema,
  type PlanChange,
} from "@/domains/billing/subscription-types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { formatDate } from "@/utils/date";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value / 100
  );
const terminal = ["APPLIED", "CANCELLED", "EXPIRED", "REVERSED"];
export function ChangePlanButton({
  subscriptionId,
  planCode,
}: {
  subscriptionId: string;
  planCode: string;
}) {
  const query = useSubscription();
  const [quote, setQuote] = useState<PlanChange | null>(null);
  const request = useServerAction({
    mutationFn: quotePlanChange,
    disableSuccessToast: true,
    onSuccess: (result) => setQuote(result.data),
  });
  const current = query.data?.planChange;
  const busy =
    !!current &&
    !terminal.includes(current.status) &&
    current.status !== "QUOTED";
  return (
    <>
      <Button
        className="w-full"
        variant="outline"
        disabled={request.isPending || busy}
        onClick={() => request.mutate({ id: subscriptionId, planCode })}
      >
        {request.isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ArrowUpRight className="size-4" />
        )}
        {busy ? "Troca em andamento" : "Simular troca de plano"}
      </Button>
      {request.error && (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {request.error.message}
        </p>
      )}
      <Dialog
        open={!!quote}
        onOpenChange={(open) => {
          if (!open) setQuote(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar para {quote?.targetPlanName}</DialogTitle>
            <DialogDescription>
              Confira os valores e quando o novo plano entra em vigor.
            </DialogDescription>
          </DialogHeader>
          {quote && (
            <PlanChangeForm
              key={quote.id}
              quote={quote}
              onDone={() => setQuote(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function PlanChangeForm({
  quote,
  onDone,
}: {
  quote: PlanChange;
  onDone: () => void;
}) {
  const form = useForm({ defaultValues: { acceptRecurring: false, password: "" } });
  const update = useServerAction({
    mutationFn: confirmPlanChange,
    invalidateQueries: [queryKeys.billing.all],
    successMessage:
      quote.kind === "DOWNGRADE"
        ? "Redução agendada. Seu plano atual continua até o fim do ciclo."
        : "Pagamento da diferença preparado.",
    onSuccess: (result) => {
      onDone();
      if (result.data.checkoutUrl) {
        const url = checkoutUrlSchema.safeParse(result.data.checkoutUrl);
        if (url.success) window.location.assign(url.data);
      }
    },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((input) => {
        if (input.acceptRecurring)
          update.mutate({ id: quote.id, acceptRecurring: true, ...(quote.kind === "DOWNGRADE" ? { password: input.password } : {}) });
      })}
    >
      <div className="bg-primary/10 space-y-2 rounded-xl border p-4">
        <p className="text-sm">
          {quote.kind === "UPGRADE"
            ? "Diferença para o restante do ciclo"
            : "Cobrança agora"}
        </p>
        <p className="text-3xl font-bold">{money(quote.amountCents)}</p>
        <p className="text-muted-foreground text-xs">
          Período atual até {formatDate(quote.periodEnd, "dd/MM/yyyy HH:mm")}.
        </p>
      </div>
      <p className="text-sm">
        {quote.kind === "UPGRADE"
          ? `O ${quote.targetPlanName} é liberado após a confirmação dessa diferença. Sua data de renovação é preservada.`
          : `Você mantém o ${quote.previousPlanName} até ${formatDate(quote.effectiveAt, "dd/MM/yyyy HH:mm")}. A redução entra no próximo ciclo, após a confirmação da mensalidade correspondente.`}
      </p>
      <p className="text-sm">
        Próximas renovações:{" "}
        <strong>{money(quote.targetPriceCents)}/mês</strong>, no cartão já
        vinculado à assinatura.
      </p>
      {quote.kind === "UPGRADE" && (
        <p className="text-muted-foreground text-xs">
          A diferença é calculada pelos dias restantes do ciclo real, sem
          reiniciar o mês. Simulação válida até{" "}
          {formatDate(quote.expiresAt, "HH:mm")}.
        </p>
      )}
      {quote.kind === "DOWNGRADE" && (
        <ControlledInput
          control={form.control}
          name="password"
          label="Confirme sua senha"
          placeholder="Senha da sua conta PromoFlow"
          type="password"
          autoComplete="current-password"
          maxLength={128}
          disabled={update.isPending}
          rules={{ required: "Informe sua senha para reduzir o plano." }}
        />
      )}
      <ControlledSingleCheckbox
        control={form.control}
        name="acceptRecurring"
        label={
          quote.kind === "UPGRADE"
            ? "Concordo com a diferença agora e com o novo valor mensal."
            : "Concordo com a redução e com o valor das próximas renovações."
        }
        rules={{
          validate: (value) => value || "Confirme os valores para continuar.",
        }}
        disabled={update.isPending}
      />
      {update.error && (
        <p role="alert" className="text-destructive text-sm">
          {update.error.message}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={update.isPending}>
        {update.isPending && <LoaderCircle className="size-4 animate-spin" />}
        {quote.kind === "UPGRADE"
          ? "Pagar diferença no Asaas"
          : "Agendar redução"}
      </Button>
    </form>
  );
}
export function PlanChangeNotice() {
  const { data } = useSubscription();
  const [confirm, setConfirm] = useState(false);
  const cancel = useServerAction({
    mutationFn: cancelPlanChange,
    invalidateQueries: [queryKeys.billing.all],
    successMessage: "Troca cancelada.",
    onSuccess: () => setConfirm(false),
  });
  const row = data?.planChange;
  if (!row || ["CANCELLED", "EXPIRED", "QUOTED"].includes(row.status))
    return null;
  const scheduled = row.status === "SCHEDULED",
    applied = row.status === "APPLIED",
    reversed = row.status === "REVERSED";
  return (
    <div className="bg-primary/5 motion-safe:animate-in motion-safe:fade-in space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        {applied ? (
          <CheckCircle2 className="text-primary size-4" />
        ) : (
          <CalendarClock className="text-primary size-4" />
        )}
        <Badge variant="outline">
          {scheduled
            ? "Redução agendada"
            : applied
              ? "Plano atualizado"
              : reversed
                ? "Diferença estornada"
                : "Troca em andamento"}
        </Badge>
      </div>
      <p className="text-sm">
        {scheduled
          ? `${row.targetPlanName} por ${money(row.targetPriceCents)}/mês a partir de ${formatDate(row.effectiveAt, "dd/MM/yyyy")}, após o pagamento da próxima mensalidade. Até lá, seu plano atual continua.`
          : applied
            ? `Troca para ${row.targetPlanName} confirmada. A data de renovação foi preservada.`
            : reversed
              ? `A diferença foi estornada. Os limites de ${row.previousPlanName} valem até ${formatDate(row.periodEnd, "dd/MM/yyyy")}. O estorno não cancela a renovação mensal.`
              : "Conclua o pagamento da diferença para liberar os novos limites. Se a confirmação estiver demorando, use “Já paguei / atualizar”."}
      </p>
      <div className="flex flex-wrap gap-2">
        {row.checkoutUrl && (
          <Button size="sm" asChild>
            <a href={row.checkoutUrl} rel="noreferrer">
              Pagar diferença
            </a>
          </Button>
        )}
        {!applied && !reversed && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancel.isPending}
            onClick={() => setConfirm(true)}
          >
            {scheduled ? "Manter plano atual" : "Cancelar troca"}
          </Button>
        )}
      </div>
      {cancel.error && (
        <p role="alert" className="text-destructive text-xs">
          {cancel.error.message}
        </p>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar esta troca?</AlertDialogTitle>
            <AlertDialogDescription>
              {scheduled
                ? `A redução será cancelada e as renovações continuarão no ${row.previousPlanName}, por ${money(row.previousPriceCents)}/mês.`
                : "O plano atual será mantido. Uma diferença que já tenha sido paga precisa ser confirmada antes de cancelar."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(row.id)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
