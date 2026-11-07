"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { getAutomation } from "@/domains/automations/client";
import { getCategories } from "@/domains/categories/client";
import {
  getWhatsAppConnections,
  getWhatsAppGroups,
} from "@/domains/whatsapp/client";
import { useAccountAccess } from "@/domains/billing/use-account-access";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { AutomationForm } from "./automation-form";
import { AutomationSkeleton } from "./automation-skeleton";

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
