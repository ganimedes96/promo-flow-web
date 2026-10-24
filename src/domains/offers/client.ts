"use client";
import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import { ApiResponsePaginated, PaginationParams } from "@/api/types";
import { encodeQueryString } from "@/utils/queries";
import { Offer } from "./types";
export async function getOffers({ page = 1, limit = 10 }: PaginationParams) {
  const response = await fetchClient<ApiResponsePaginated<Offer[]>>(
    "/offers" + encodeQueryString({ page, perPage: limit })
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return response;
}
