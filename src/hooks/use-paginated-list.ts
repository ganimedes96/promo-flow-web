"use client";

import { ApiResponsePaginated } from "@/api/types";
import { toast } from "@/lib/toast";
import {
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";

type UsePaginatedListParams<T> = {
  queryKey: QueryKey;
  refetchInterval?: number | false;
  queryFn: (params: { page: number }) => Promise<ApiResponsePaginated<T[]>>;
};

export function usePaginatedList<T>({
  queryKey,
  queryFn,
  refetchInterval,
}: UsePaginatedListParams<T>) {
  const queryPaginated = useInfiniteQuery<
    ApiResponsePaginated<T[]>,
    Error,
    InfiniteData<ApiResponsePaginated<T>, number>,
    QueryKey,
    number
  >({
    queryKey: [...queryKey],
    refetchInterval,
    queryFn: ({ pageParam: page }) => queryFn({ page }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { page, lastPage: last } = lastPage.pagination;
      return page < last ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (queryPaginated.error) {
      console.error(queryPaginated.error);
      toast.error(queryPaginated.error.message);
    }
  }, [queryPaginated.error]);

  const items =
    queryPaginated.data?.pages.flatMap((page) => page.data || []) ?? [];
  const total = queryPaginated.data?.pages?.[0]?.pagination?.total ?? 0;
  const currentTotal = items.length ?? 0;

  return {
    items,
    total,
    currentTotal,
    ...queryPaginated,
  };
}
