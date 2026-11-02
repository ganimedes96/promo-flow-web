"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import {
  checkoutSchema,
  type CheckoutInput,
  type BillingStatus,
} from "./subscription-types";
function failure(error: unknown): ApiResponseError {
  return {
    status: "error",
    code: 400,
    timestamp: new Date().toISOString(),
    message:
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "Não foi possível atualizar sua assinatura.",
  };
}
export async function createSubscriptionCheckout(
  input: CheckoutInput
): Promise<ApiResponse<BillingStatus> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<BillingStatus>>("/billing/checkout", {
      method: "POST",
      body: checkoutSchema.parse(input),
    });
  } catch (error) {
    return failure(error);
  }
}
export async function cancelSubscription(
  id: string
): Promise<ApiResponse<BillingStatus> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<BillingStatus>>(
      "/billing/subscription/" + z.string().uuid().parse(id) + "/cancel",
      { method: "POST" }
    );
  } catch (error) {
    return failure(error);
  }
}
export async function syncSubscription(
  id: string
): Promise<ApiResponse<BillingStatus> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<BillingStatus>>(
      "/billing/subscription/" + z.string().uuid().parse(id) + "/sync",
      { method: "POST" }
    );
  } catch (error) {
    return failure(error);
  }
}
