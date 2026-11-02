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
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        ["CREATING", "WAITING", "REVIEW_REQUIRED"].includes(
          data?.subscription?.status || ""
        ) ||
        ["REQUESTING", "WAITING", "REVIEW_REQUIRED", "PAID_APPLYING"].includes(
          data?.planChange?.status || ""
        )
      )
        return 10000;
      return data?.planChange?.status === "SCHEDULED" ? 60000 : false;
    },
    staleTime: 5000,
  });
}
