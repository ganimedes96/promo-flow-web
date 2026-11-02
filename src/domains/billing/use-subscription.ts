"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getBillingSubscription } from "./client";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function useSubscription() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: queryKeys.billing.subscription(session?.user.id),
    queryFn: getBillingSubscription,
    enabled: !!session?.user.id,
    retry: false,
    refetchInterval: (query) =>
      ["CREATING", "WAITING", "REVIEW_REQUIRED"].includes(
        query.state.data?.subscription?.status || ""
      )
        ? 10000
        : false,
    staleTime: 5000,
  });
}
