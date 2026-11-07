"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import {
  adjustClientSubscriptionSchema,
  changeClientSchema,
  type Client,
  type ChangeClient,
  type AdjustClientSubscription,
} from "./types";
export async function changeClientAccess(input: {
  id: string;
  change: ChangeClient;
}): Promise<ApiResponse<Client> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<Client>>(
      "/clients/" + z.string().uuid().parse(input.id) + "/access",
      { method: "PUT", body: changeClientSchema.parse(input.change) }
    );
  } catch (error) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Não foi possível atualizar o cliente.",
    };
  }
}

export async function adjustClientSubscription(input: {
  id: string;
  adjustment: AdjustClientSubscription;
}): Promise<ApiResponse<{ effectiveAt: string }> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<{ effectiveAt: string }>>(
      "/clients/" + z.string().uuid().parse(input.id) + "/adjustment",
      {
        method: "PUT",
        body: adjustClientSubscriptionSchema.parse(input.adjustment),
      }
    );
  } catch (error) {
    const details =
      typeof error === "object" && error !== null
        ? (error as Partial<ApiResponseError>)
        : undefined;
    return {
      status: "error",
      code: typeof details?.code === "number" ? details.code : 400,
      timestamp: new Date().toISOString(),
      requestId: typeof details?.requestId === "string" ? details.requestId : undefined,
      message:
        error instanceof Error
          ? error.message
          : typeof details?.message === "string" && details.message
            ? details.message
          : "Não foi possível agendar o ajuste da assinatura.",
    };
  }
}
