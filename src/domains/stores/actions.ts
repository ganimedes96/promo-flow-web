"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import {
  AffiliateStore,
  Marketplace,
  StoreInput,
  marketplaces,
  storeInputSchema,
} from "./types";
function failure(error: unknown): ApiResponseError {
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
          : "Não foi possível atualizar a loja.",
  };
}
export async function saveStore(
  marketplace: Marketplace,
  body: StoreInput
): Promise<ApiResponse<AffiliateStore> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<AffiliateStore>>(
      "/stores/" + z.enum(marketplaces).parse(marketplace),
      { method: "PUT", body: storeInputSchema.parse(body) }
    );
  } catch (error) {
    return failure(error);
  }
}
export async function deleteStore(
  id: string
): Promise<ApiResponse<{ removed: boolean }> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<{ removed: boolean }>>(
      "/stores/" + z.string().uuid().parse(id),
      { method: "DELETE" }
    );
  } catch (error) {
    return failure(error);
  }
}
