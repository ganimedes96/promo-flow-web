"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getAccountAccess } from "./client";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function useAccountAccess() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: queryKeys.billing.access(session?.user.id),
    queryFn: getAccountAccess,
    enabled: !!session?.user.id,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
