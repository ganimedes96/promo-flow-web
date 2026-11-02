"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Settings2, Check, FlaskConical, Sparkles, Layers } from "lucide-react";
import { getManagedPlans } from "@/domains/plans/client";
import { savePlan } from "@/domains/plans/actions";
import { planInputSchema, type ManagedPlan } from "@/domains/plans/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledInputCurrency } from "@/components/form/controllers/controlled-input-currency";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { PlansSkeleton } from "@/components/feedback/loading-skeletons";
const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100
  );
const formSchema = planInputSchema
  .omit({ monthlyPriceCents: true, expectedUpdatedAt: true })
  .extend({ price: z.number().min(0).max(10000) });
type PlanForm = z.infer<typeof formSchema>;
const limits = [
  { name: "maxConnections", label: "Conexões WhatsApp", max: 1000, min: 1 },
  {
    name: "maxGroups",
    label: "Grupos de destino favoritos",
    max: 10000,
    min: 1,
  },
  {
    name: "maxMirroredGroups",
    label: "Origens espelhadas (WhatsApp + Telegram)",
    max: 1000,
    min: 0,
  },
  {
    name: "maxDailyPublications",
    label: "Publicações por dia",
    max: 100000,
    min: 1,
  },
  { name: "maxStores", label: "Lojas configuradas", max: 3, min: 1 },
] as const;
export function PlansPanel() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<ManagedPlan | null>(null);
  const query = useQuery({
    queryKey: queryKeys.plans.list(session?.user.id),
    queryFn: getManagedPlans,
    retry: false,
  });
  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline">Administração</Badge>
        <h1 className="mt-3 text-3xl font-semibold">Planos e limites</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Defina a capacidade de cada plano. Preços novos se aplicam às novas
          contratações; assinaturas existentes mantêm o valor contratado.
        </p>
      </header>
      <div className="bg-primary/10 border-primary/25 rounded-xl border p-4 text-sm">
        Os limites são aplicados no backend. Alterações valem para quem usa o
        plano; a duração do teste afeta somente novos cadastros. Dados
        existentes são preservados. Se houver excesso de grupos, remova os
        favoritos ou origens extras para retomar.
      </div>
      {query.isPending ? (
        <PlansSkeleton />
      ) : query.isError ? (
        <ApiErrorCard
          title="Não foi possível consultar os planos"
          error={query.error}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {query.data.map((plan) => {
            const Icon =
              plan.code === "TRIAL"
                ? FlaskConical
                : plan.code === "ESSENTIAL"
                  ? Sparkles
                  : Layers;
            return (
              <Card
                key={plan.code}
                className="from-primary/15 via-card to-card motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 bg-gradient-to-br transition-transform"
              >
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <Icon className="text-primary size-7" />
                    <Badge variant="outline">
                      {plan.code === "TRIAL"
                        ? `${plan.trialDays} dias`
                        : plan.isActive
                          ? "Disponível"
                          : "Oculto"}
                    </Badge>
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-5">
                  <p className="text-3xl font-bold">
                    {money(plan.monthlyPriceCents)}
                    <span className="text-muted-foreground text-sm font-normal">
                      {plan.code === "TRIAL" ? " / teste" : " / mês"}
                    </span>
                  </p>
                  <ul className="space-y-3 text-sm">
                    {limits.map((item) => (
                      <li className="flex gap-2" key={item.name}>
                        <Check className="text-primary size-4 shrink-0" />
                        <span>
                          <strong>{plan[item.name]}</strong>{" "}
                          {item.label.toLowerCase()}
                        </span>
                      </li>
                    ))}
                    <li className="flex gap-2">
                      <Check className="text-primary size-4 shrink-0" />
                      Marca d’água:{" "}
                      {plan.watermarkEnabled ? "incluída" : "não incluída"}
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelected(plan)}
                  >
                    <Settings2 className="size-4" />
                    Configurar plano
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        Todos incluem Central de promoções, extensão, conversão Mercado
        Livre/Shopee, agendamento e mensagem personalizada. Cada destino consome
        uma publicação; envios sem confirmação mantêm a reserva. A cota renova à
        meia-noite de São Paulo.
      </p>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Configurar {selected?.name}</SheetTitle>
            <SheetDescription>
              Atualize os valores e limites deste plano.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <PlanEditor
              key={selected.code + selected.updatedAt}
              plan={selected}
              onSaved={() => setSelected(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
function PlanEditor({
  plan,
  onSaved,
}: {
  plan: ManagedPlan;
  onSaved: () => void;
}) {
  const form = useForm<PlanForm>({
    defaultValues: {
      password: "",
      name: plan.name,
      description: plan.description,
      price: plan.monthlyPriceCents / 100,
      maxConnections: plan.maxConnections,
      maxGroups: plan.maxGroups,
      maxMirroredGroups: plan.maxMirroredGroups,
      maxDailyPublications: plan.maxDailyPublications,
      maxStores: plan.maxStores,
      watermarkEnabled: plan.watermarkEnabled,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
    },
  });
  const priceChanged =
    Math.round(form.watch("price") * 100) !== plan.monthlyPriceCents;
  const update = useServerAction({
    mutationFn: savePlan,
    invalidateQueries: [queryKeys.plans.all, ["billing"]],
    successMessage: "Plano atualizado.",
    onSuccess: onSaved,
  });
  return (
    <form
      className="space-y-5 p-5"
      onSubmit={form.handleSubmit((input) => {
        const parsed = formSchema.safeParse(input);
        if (!parsed.success) {
          form.setError("root", {
            message: parsed.error.issues[0]?.message || "Confira os campos.",
          });
          return;
        }
        const { price, password, ...values } = parsed.data;
        if (priceChanged && !password) {
          form.setError("password", {
            message: "Informe sua senha para alterar o preço.",
          });
          return;
        }
        update.mutate({
          code: plan.code,
          body: {
            ...values,
            ...(priceChanged ? { password } : {}),
            monthlyPriceCents: Math.round(price * 100),
            expectedUpdatedAt: plan.updatedAt,
          },
        });
      })}
    >
      <ControlledInput
        control={form.control}
        name="name"
        label="Nome do plano"
        placeholder="Nome"
        disabled={update.isPending}
      />
      <ControlledInput
        control={form.control}
        name="description"
        label="Descrição"
        placeholder="Para quem é este plano"
        disabled={update.isPending}
        maxLength={500}
      />
      <ControlledInputCurrency
        control={form.control}
        name="price"
        label="Mensalidade (R$)"
        disabled={update.isPending || plan.code === "TRIAL"}
      />
      {priceChanged && (
        <div className="border-primary/25 bg-primary/10 space-y-3 rounded-xl border p-4">
          <p className="text-sm">
            Para confirmar a alteração de {money(plan.monthlyPriceCents)} para{" "}
            {money(Math.round(form.watch("price") * 100))}, informe sua senha de
            administrador. Assinaturas existentes mantêm o preço contratado.
          </p>
          <ControlledInput
            control={form.control}
            name="password"
            label="Sua senha de administrador"
            type="password"
            placeholder="Confirme sua senha"
            autoComplete="current-password"
            maxLength={128}
            disabled={update.isPending}
          />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {limits.map((item) => (
          <ControlledInput
            key={item.name}
            control={form.control}
            name={item.name}
            label={item.label}
            placeholder="Quantidade"
            type="number"
            min={item.min}
            max={item.max}
            disabled={update.isPending}
          />
        ))}
        {plan.code === "TRIAL" && (
          <ControlledInput
            control={form.control}
            name="trialDays"
            label="Duração do teste (dias)"
            placeholder="10"
            type="number"
            min={1}
            max={365}
            disabled={update.isPending}
          />
        )}
      </div>
      <ControlledSwitch
        control={form.control}
        name="watermarkEnabled"
        label="Permitir marca d’água"
        disabled={update.isPending}
      />
      {plan.code !== "TRIAL" && (
        <ControlledSwitch
          control={form.control}
          name="isActive"
          label="Exibir na página de assinatura"
          description="Ocultar não cancela o acesso de clientes existentes."
          disabled={update.isPending}
        />
      )}
      {form.formState.errors.root && (
        <p role="alert" className="text-destructive text-sm">
          {form.formState.errors.root.message}
        </p>
      )}
      {update.error && (
        <p role="alert" className="text-destructive text-sm">
          {update.error.message}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={update.isPending}>
        {update.isPending ? "Salvando…" : "Salvar configuração"}
      </Button>
    </form>
  );
}
