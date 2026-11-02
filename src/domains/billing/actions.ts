"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import {
  planChangeSchema,
  type PlanChange,
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
export async function cancelSubscription(input: {
  id: string;
  password: string;
}): Promise<ApiResponse<BillingStatus> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<BillingStatus>>(
      "/billing/subscription/" + z.string().uuid().parse(input.id) + "/cancel",
      {
        method: "POST",
        body: { password: z.string().min(1).max(128).parse(input.password) },
      }
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

export async function quotePlanChange(input: {
  id: string;
  planCode: string;
}): Promise<ApiResponse<PlanChange> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<PlanChange>>(
      "/billing/subscription/" +
        z.string().uuid().parse(input.id) +
        "/plan-quote",
      {
        method: "POST",
        body: {
          planCode: z.enum(["ESSENTIAL", "PROFESSIONAL"]).parse(input.planCode),
        },
      }
    );
  } catch (error) {
    return failure(error);
  }
}
export async function confirmPlanChange(input: {
  id: string;
  acceptRecurring: true;
}): Promise<ApiResponse<PlanChange> | ApiResponseError> {
  try {
    z.literal(true).parse(input.acceptRecurring);
    const result = await fetchServer<ApiResponse<PlanChange>>(
      "/billing/plan-change/" + z.string().uuid().parse(input.id) + "/confirm",
      { method: "POST", body: { acceptRecurring: true } }
    );
    if (result.status === "success") planChangeSchema.parse(result.data);
    return result;
  } catch (error) {
    return failure(error);
  }
}
export async function cancelPlanChange(
  id: string
): Promise<ApiResponse<PlanChange> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<PlanChange>>(
      "/billing/plan-change/" + z.string().uuid().parse(id) + "/cancel",
      { method: "POST" }
    );
  } catch (error) {
    return failure(error);
  }
}
