"use client";
import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { billingStatusSchema } from "./subscription-types";
import { AccountAccess, SubscriptionPlan } from "./types";
export async function getAccountAccess(): Promise<AccountAccess> {
  const response =
    await fetchClient<ApiResponse<AccountAccess>>("/billing/access");
  if (response.status !== "success") throw new Error(response.message);
  return response.data;
}
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response =
    await fetchClient<ApiResponse<SubscriptionPlan[]>>("/billing/plans");
  if (response.status !== "success") throw new Error(response.message);
  return response.data;
}

export async function getBillingSubscription() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/billing/subscription"
  );
  if (response.status !== "success") throw new Error(response.message);
  return billingStatusSchema.parse(response.data);
}
