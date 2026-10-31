"use client";
import { z } from "zod";
import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import {
  ApiResponse,
  ApiResponsePaginated,
  PaginationParams,
} from "@/api/types";
import { encodeQueryString } from "@/utils/queries";
import { Offer, OfferGroup, OfferListFilters } from "./types";
export async function getOffers({ page = 1, limit = 10 }: PaginationParams) {
  const response = await fetchClient<ApiResponsePaginated<Offer[]>>(
    "/offers" + encodeQueryString({ page, perPage: limit })
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return response;
}

export async function getDuplicateOffers(sourceUrl: string): Promise<Offer[]> {
  const response = await fetchClient<ApiResponse<Offer[]>>(
    "/offers/duplicates",
    { method: "POST", body: { url: sourceUrl } }
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return response.data;
}

export async function getGroupedOffers({
  page = 1,
  limit = 10,
  ...filters
}: PaginationParams & OfferListFilters) {
  const response = await fetchClient<ApiResponsePaginated<OfferGroup[]>>(
    "/offers/grouped" + encodeQueryString({ page, perPage: limit, ...filters })
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return response;
}

export async function getOfferFilterGroups() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/offers/filter-groups"
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        connectionId: z.string().uuid().nullable(),
      })
    )
    .parse(response.data);
}
