"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Controller, type Control, useForm, useWatch } from "react-hook-form";
import { Check, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledTimePicker } from "@/components/form/controllers/controlled-time-picker";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
import { getAutomation } from "@/domains/automations/client";
import { saveAutomation } from "@/domains/automations/actions";
import { automationSchema, type Automation } from "@/domains/automations/types";
import { getCategories } from "@/domains/categories/client";
import {
  getWhatsAppConnections,
  getWhatsAppGroups,
} from "@/domains/whatsapp/client";
import { useAccountAccess } from "@/domains/billing/use-account-access";
import { useServerAction } from "@/hooks/use-server-action";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/lib/tanstack-query/keys";

const stores = [
  { id: "MERCADO_LIVRE", name: "Mercado Livre" },
  { id: "SHOPEE", name: "Shopee" },
  { id: "AMAZON", name: "Amazon" },
];
const weekdays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
].map((name, id) => ({ id, name }));

type ScheduleFormValues = Omit<Automation, "intervalMinutes"> & {
  intervalMinutes: string;
  dayOptions: string[];
  whatsappGroups: string[];
  telegramGroups: string[];
};

function ScheduleClock({ control }: { control: Control<ScheduleFormValues> }) {
  const [start, end] = useWatch({ control, name: ["start", "end"] });
  const [hours = 0, minutes = 0] = start.split(":").map(Number);

  return (
    <div className="bg-card/70 flex flex-col items-center justify-center gap-2 rounded-xl border p-3">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="text-primary size-24"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {Array.from({ length: 12 }, (_, tick) => (
          <path
            key={tick}
            d="M50 11v5"
            transform={`rotate(${tick * 30} 50 50)`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path
            d="M50 50V29"
            strokeWidth="5"
            transform={`rotate(${hours * 30 + minutes / 2} 50 50)`}
          />
          <path
            d="M50 50V19"
            strokeWidth="3"
            transform={`rotate(${minutes * 6} 50 50)`}
          />
          <path
            d="M50 57V14"
            strokeWidth="1.5"
            className="origin-center opacity-65 motion-safe:animate-[spin_60s_linear_infinite]"
          />
        </g>
        <circle cx="50" cy="50" r="4" fill="currentColor" />
      </svg>
      <p className="text-sm font-semibold tabular-nums">
        {start || "—"} – {end || "—"}
      </p>
      <p className="text-muted-foreground text-xs">Janela de envio</p>
    </div>
  );
}

export function AutomationPanel() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const key = queryKeys.automations.settings(userId);
  const settings = useQuery({
    queryKey: key,
    queryFn: getAutomation,
    enabled: !!userId,
    retry: false,
  });
  const choices = useQuery({
    queryKey: queryKeys.automations.choices(userId),
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      const [connections, categories, allGroups] = await Promise.all([
        getWhatsAppConnections(),
        getCategories(),
        getWhatsAppGroups(),
      ]);
      const byId = new Map(
        connections.connections.map((connection) => [connection.id, connection])
      );
      const groups = allGroups
        .filter((group) => group.isFavorite)
        .map((group) => {
          const connection = group.connectionId
            ? byId.get(group.connectionId)
            : undefined;
          return {
            id: group.id,
            canPublish: connection?.status === "READY" && !connection.isPaused,
            name: connection
              ? group.name + " · " + connection.name
              : group.name,
            platform:
              group.platform === "TELEGRAM" ||
              connection?.provider === "TELEGRAM_BOT"
                ? ("telegram" as const)
                : ("whatsapp" as const),
          };
        });
      return { groups, categories };
    },
  });
  const access = useAccountAccess();
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Zap className="text-primary size-6" />
          Automações
        </h1>
        <p className="text-muted-foreground text-sm">
          Defina como as ofertas espelhadas entram na sua fila depois que o seu
          link de afiliado estiver pronto.
        </p>
      </header>
      {settings.isError ? (
        <ApiErrorCard
          title="Não foi possível carregar a automação"
          error={settings.error}
          onRetry={() => void settings.refetch()}
          retrying={settings.isFetching}
        />
      ) : choices.isError ? (
        <ApiErrorCard
          title="Não foi possível carregar os destinos e categorias"
          error={choices.error}
          onRetry={() => void choices.refetch()}
          retrying={choices.isFetching}
        />
      ) : !settings.data || !choices.data ? (
        <AutomationSkeleton />
      ) : (
        <AutomationForm
          initial={settings.data}
          groups={choices.data.groups}
          categories={choices.data.categories}
          userId={userId}
          planLimit={access.data?.plan?.maxDailyPublications}
        />
      )}
    </section>
  );
}

function AutomationSkeleton() {
  return (
    <div className="space-y-5" role="status">
      <span className="sr-only">Carregando configurações de automação</span>
      <div aria-hidden="true" className="grid gap-5 lg:grid-cols-2">
        {[
          { id: "mode", layout: "lg:col-span-2", height: "h-16" },
          { id: "destinations", layout: "", height: "h-28" },
          { id: "filters", layout: "", height: "h-28" },
          { id: "schedule", layout: "lg:col-span-2", height: "h-36" },
        ].map(({ id, layout, height }) => (
          <Card key={id} className={layout}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-3/4 max-w-sm" />
            </CardHeader>
            <CardContent>
              <Skeleton className={height} />
            </CardContent>
          </Card>
        ))}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AutomationForm({
  initial,
  groups,
  categories,
  userId,
  planLimit,
}: {
  initial: Automation;
  groups: {
    id: string;
    name: string;
    platform: "whatsapp" | "telegram";
    canPublish: boolean;
  }[];
  categories: { id: string; name: string }[];
  userId?: string;
  planLimit?: number;
}) {
  const whatsapp = groups.filter((group) => group.platform === "whatsapp");
  const telegram = groups.filter((group) => group.platform === "telegram");
  const form = useForm<ScheduleFormValues>({
    defaultValues: {
      ...initial,
      intervalMinutes: String(initial.intervalMinutes),
      dayOptions: initial.days.map(String),
      whatsappGroups: initial.groupIds.filter((id) =>
        whatsapp.some((group) => group.id === id)
      ),
      telegramGroups: initial.groupIds.filter((id) =>
        telegram.some((group) => group.id === id)
      ),
    },
  });
  const [enabled, whatsappSelection, telegramSelection] = useWatch({
    control: form.control,
    name: ["enabled", "whatsappGroups", "telegramGroups"],
  });
  const selectedCount = whatsappSelection.length + telegramSelection.length;
  const { isDirty, errors } = form.formState;
  const save = useServerAction({
    mutationFn: saveAutomation,
    invalidateQueries: [queryKeys.automations.settings(userId)],
    successMessage: "Automação salva.",
    onSuccess: ({ data }) => {
      form.reset({
        ...data,
        intervalMinutes: String(data.intervalMinutes),
        dayOptions: data.days.map(String),
        whatsappGroups: data.groupIds.filter((id) =>
          whatsapp.some((group) => group.id === id)
        ),
        telegramGroups: data.groupIds.filter((id) =>
          telegram.some((group) => group.id === id)
        ),
      });
    },
  });
  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(
        ({ dayOptions, whatsappGroups, telegramGroups, ...values }) => {
          const groupIds = [...whatsappGroups, ...telegramGroups];
          if (values.enabled) {
            const message = !values.marketplaces.length
              ? "Selecione pelo menos uma loja em Filtros de ofertas."
              : !groupIds.length
                ? "Selecione pelo menos um grupo favorito em Destinos."
                : groupIds.some(
                      (id) =>
                        !groups.some(
                          (group) => group.id === id && group.canPublish
                        )
                    )
                  ? "Conecte ou retome os envios das conexões dos destinos selecionados."
                  : null;
            if (message) {
              form.setError("root", { message });
              toast.error(message);
              return;
            }
          }
          const parsed = automationSchema.safeParse({
            ...values,
            groupIds,
            days: dayOptions.map(Number),
            dailyLimit: Number(values.dailyLimit),
            intervalMinutes: Number(values.intervalMinutes),
          });
          if (!parsed.success) {
            const message = "Confira os destinos, dias, horários e limites.";
            form.setError("root", { message });
            toast.error(message);
            return;
          }
          form.clearErrors("root");
          save.mutate(parsed.data);
        }
      )}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>1. Modo de publicação</CardTitle>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? "bg-lime-300 text-lime-950" : "bg-amber-300 text-amber-950"}`}
            >
              {enabled ? "Agendamento automático" : "Revisão manual"}
            </span>
          </div>
          <CardDescription>
            Com a automação desligada, as ofertas novas ficam para revisão e os
            envios automáticos pendentes aguardam a reativação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ControlledSwitch
            control={form.control}
            name="enabled"
            label="Agendar automaticamente"
            description={
              enabled
                ? "As ofertas elegíveis entram na fila automática."
                : "Você revisa e agenda cada oferta."
            }
            switchClassName="cursor-pointer data-[size=default]:h-6 data-[size=default]:w-11 data-[state=unchecked]:border-muted-foreground/60 data-[state=unchecked]:bg-muted dark:data-[state=unchecked]:bg-muted data-[state=checked]:bg-primary [&_[data-slot=switch-thumb]]:bg-white dark:[&_[data-slot=switch-thumb]]:bg-white [&_[data-state=checked][data-slot=switch-thumb]]:translate-x-5 [&_[data-state=unchecked][data-slot=switch-thumb]]:translate-x-1"
          />
          <aside className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <ShieldAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300"
            />
            <div className="space-y-1">
              <p className="font-medium">
                Risco de bloqueio do número no WhatsApp
              </p>
              <p className="text-muted-foreground">
                Envios automáticos frequentes ou mensagens denunciadas como spam
                podem levar a restrições ou ao bloqueio do número. Envie apenas
                para grupos que esperam receber suas ofertas. O intervalo entre
                envios reduz a frequência, mas o risco continua.
              </p>
            </div>
          </aside>
        </CardContent>
      </Card>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>2. Destinos</CardTitle>
            <CardDescription>
              Escolha os grupos que receberão as ofertas aprovadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="whatsapp" className="w-full min-w-0 flex-col">
              <TabsList
                className="grid h-auto w-full shrink-0 grid-cols-2 gap-1 rounded-xl p-1"
                aria-label="Serviço de destino"
              >
                {(
                  [
                    {
                      platform: "whatsapp",
                      label: "WhatsApp",
                      count: whatsappSelection.length,
                    },
                    {
                      platform: "telegram",
                      label: "Telegram",
                      count: telegramSelection.length,
                    },
                  ] as const
                ).map(({ platform, label, count }) => (
                  <TabsTrigger
                    key={platform}
                    value={platform}
                    className="group/channel data-[state=active]:border-primary/60 data-[state=active]:bg-primary/15 data-[state=active]:text-foreground h-auto min-w-0 flex-wrap gap-1.5 rounded-lg px-2 py-2 motion-reduce:transition-none"
                  >
                    <span className="opacity-75 group-data-[state=active]/channel:opacity-100 motion-safe:transition-[transform,opacity] motion-safe:group-data-[state=active]/channel:scale-110">
                      <AnimatedChannelIcon platform={platform} compact />
                    </span>
                    <span>{label}</span>
                    <span className="bg-background/70 group-data-[state=active]/channel:bg-primary/20 rounded-full px-1.5 py-0.5 text-xs tabular-nums">
                      {count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {(
                [
                  {
                    platform: "whatsapp",
                    label: "WhatsApp",
                    field: "whatsappGroups",
                    options: whatsapp,
                  },
                  {
                    platform: "telegram",
                    label: "Telegram",
                    field: "telegramGroups",
                    options: telegram,
                  },
                ] as const
              ).map(({ platform, label, field, options }) => (
                <TabsContent
                  key={platform}
                  value={platform}
                  className="bg-muted/20 motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in motion-safe:data-[state=active]:slide-in-from-bottom-1 mt-2 min-h-24 w-full min-w-0 rounded-xl border p-4 motion-safe:duration-200"
                >
                  {options.length ? (
                    <ControlledMultiSelect
                      control={form.control}
                      name={field}
                      label={`Destinos favoritos no ${label}`}
                      options={options}
                      maxSelected={20}
                      searchable
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Marque um destino do {label} como favorito em{" "}
                      <Link href="/groups" className="underline">
                        Grupos
                      </Link>
                      .
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
            <p className="text-muted-foreground text-xs">
              {selectedCount} de 20 destinos selecionados nas duas abas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Filtros de ofertas</CardTitle>
            <CardDescription>
              Escolha as lojas e categorias que podem entrar na fila automática.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ControlledMultiSelect
              control={form.control}
              name="marketplaces"
              label="Lojas permitidas"
              options={stores}
            />
            <ControlledMultiSelect
              control={form.control}
              name="categoryIds"
              label="Categorias permitidas"
              options={categories}
              placeholder="Todas as categorias"
              searchable
            />
            <p className="text-muted-foreground text-xs">
              Ao escolher categorias, ofertas sem classificação ficam para
              revisão. Na Amazon, informe um link direto com a mesma tag de
              afiliado cadastrada em Lojas.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>4. Horários e limites</CardTitle>
          <CardDescription>
            Horário de Brasília. Cada destino conta como uma publicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-primary/25 from-primary/10 to-card grid gap-5 rounded-2xl border bg-gradient-to-br p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_10rem]">
            <div className="min-w-0 space-y-4">
              <Controller
                control={form.control}
                name="dayOptions"
                render={({ field }) => (
                  <fieldset className="min-w-0 space-y-2">
                    <legend className="text-sm font-medium">
                      Dias de envio
                    </legend>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {weekdays.map(({ id, name }) => {
                        const value = String(id);
                        const selected = field.value.includes(value);
                        return (
                          <Button
                            key={id}
                            type="button"
                            variant="outline"
                            aria-label={name}
                            aria-pressed={selected}
                            onBlur={field.onBlur}
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((day) => day !== value)
                                  : [...field.value, value]
                              )
                            }
                            className="border-border bg-card h-14 flex-col gap-1 rounded-xl px-1 aria-pressed:border-lime-700 aria-pressed:bg-lime-50 aria-pressed:text-lime-800 aria-pressed:hover:bg-lime-100 aria-pressed:hover:text-lime-800 motion-safe:transition-all motion-safe:hover:-translate-y-0.5 dark:aria-pressed:border-lime-300/60 dark:aria-pressed:bg-lime-300/10 dark:aria-pressed:text-lime-300 dark:aria-pressed:hover:bg-lime-300/15 dark:aria-pressed:hover:text-lime-300"
                          >
                            <span>{name.slice(0, 3)}</span>
                            {selected ? (
                              <span
                                aria-hidden="true"
                                className="grid size-3.5 place-items-center rounded-full bg-lime-300 text-lime-950"
                              >
                                <Check className="size-3" strokeWidth={3} />
                              </span>
                            ) : (
                              <span
                                aria-hidden="true"
                                className="size-3.5 rounded-full border border-current opacity-40"
                              />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <ControlledTimePicker
                  control={form.control}
                  name="start"
                  label="Início"
                  placeholder="Selecione o início"
                />
                <ControlledTimePicker
                  control={form.control}
                  name="end"
                  label="Fim"
                  placeholder="Selecione o fim"
                  allowEndOfDay
                />
              </div>
            </div>
            <ScheduleClock control={form.control} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledInput
              control={form.control}
              name="dailyLimit"
              label="Limite diário"
              type="number"
              min={1}
              max={planLimit ?? 100000}
              placeholder="50"
            />
            <ControlledSelect
              control={form.control}
              name="intervalMinutes"
              label="Intervalo entre envios automáticos"
              placeholder="Selecione um intervalo"
              className="w-full"
              options={[
                ...new Set([
                  2,
                  5,
                  10,
                  15,
                  20,
                  30,
                  45,
                  60,
                  90,
                  120,
                  180,
                  360,
                  720,
                  1440,
                  initial.intervalMinutes,
                ]),
              ]
                .sort((a, b) => a - b)
                .map((minutes) => ({
                  id: String(minutes),
                  name:
                    minutes < 60
                      ? `${minutes} min`
                      : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ""}`,
                }))}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {planLimit !== undefined
              ? "Seu plano permite até " + planLimit + " publicações por dia. "
              : ""}
            O intervalo mínimo é de 2 minutos.
          </p>
        </CardContent>
      </Card>
      <Card className="border-primary/25">
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Configuração salva
              </p>
              <CardTitle className="mt-1 text-xl">
                {initial.enabled ? "Agendamento automático" : "Revisão manual"}
              </CardTitle>
            </div>
            <span role="status" className="text-warning text-sm font-medium">
              {isDirty && "Alterações não salvas"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {initial.enabled && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="bg-muted/40 min-w-0 space-y-1 rounded-lg border p-3">
                <dt className="font-semibold">Destinos</dt>
                <dd>
                  <ul
                    className="grid max-h-56 gap-2 overflow-y-auto overscroll-contain pr-1"
                    tabIndex={0}
                    aria-label="Destinos salvos"
                  >
                    {initial.groupIds.map((id) => {
                      const group = groups.find(
                        (destination) => destination.id === id
                      );
                      return (
                        <li
                          key={id}
                          className="bg-card flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2"
                        >
                          {group && (
                            <span aria-hidden="true" className="shrink-0">
                              <AnimatedChannelIcon
                                platform={group.platform}
                                compact
                              />
                            </span>
                          )}
                          <span className="min-w-0 text-sm font-medium wrap-break-word">
                            {group?.name ?? "Destino indisponível"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
              <div className="bg-muted/40 space-y-1 rounded-lg border p-3">
                <dt className="font-semibold">Janela de envio</dt>
                <dd className="text-muted-foreground">
                  {weekdays
                    .filter(({ id }) => initial.days.includes(id))
                    .map(({ name }) => name.slice(0, 3))
                    .join(", ")}
                </dd>
                <dd className="font-medium tabular-nums">
                  {initial.start} às {initial.end} (Brasília)
                </dd>
              </div>
            </dl>
          )}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {errors.root?.message && (
                <p role="alert" className="text-destructive text-sm">
                  {errors.root.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={save.isPending}
              loading={save.isPending}
              className="shrink-0"
            >
              Salvar automação
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
