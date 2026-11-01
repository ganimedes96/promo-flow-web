"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getMessageSettings } from "../client";
import { MessageProduct } from "../types";
import { MessagePreview } from "./message-preview";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
export function OfferMessagePreview({ product }: { product: MessageProduct }) {
  const { data: session } = useSession();
  const settings = useQuery({
    queryKey: queryKeys.messageSettings.forUser(session?.user.id),
    queryFn: getMessageSettings,
    enabled: !!session?.user.id,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  });
  if (settings.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (settings.isError || !settings.data)
    return (
      <ApiErrorCard
        title="Não foi possível carregar a prévia"
        error={settings.error}
        onRetry={() => void settings.refetch()}
        retrying={settings.isFetching}
      />
    );
  return (
    <MessagePreview
      template={settings.data}
      product={product}
      showSettingsLink
    />
  );
}
