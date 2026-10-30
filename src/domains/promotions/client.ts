"use client";
import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { Promotion } from "./types";
export async function getPromotions(page: number, manage: boolean) {
  const result = await fetchClient<
    ApiResponse<{ items: Promotion[]; total: number }>
  >(`/promotions${manage ? "/manage" : ""}?page=${page}&perPage=12`);
  return result.data;
}
