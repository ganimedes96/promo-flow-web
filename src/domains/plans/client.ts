"use client";
import { fetchClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import { planSchema } from "./types";
export async function getManagedPlans() {
  const result = await fetchClient<ApiResponse<unknown>>("/plans");
  if (result.status !== "success") throw new Error(result.message);
  return planSchema.array().parse(result.data);
}
