"use server";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { Promotion, PromotionInput, promotionSchema } from "./types";
export async function savePromotion(
  body: PromotionInput & { id?: string }
): Promise<ApiResponse<Promotion> | ApiResponseError> {
  try {
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success)
      throw new Error(parsed.error.issues[0]?.message || "Confira os dados.");
    return await fetchServer<ApiResponse<Promotion>>(
      body.id ? `/promotions/${encodeURIComponent(body.id)}` : "/promotions",
      { method: body.id ? "PUT" : "POST", body: parsed.data }
    );
  } catch (error: unknown) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a promoção.",
    };
  }
}
export async function deletePromotion(body: {
  id: string;
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<unknown>>(
      `/promotions/${encodeURIComponent(body.id)}`,
      { method: "DELETE" }
    );
  } catch {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message: "Não foi possível excluir a promoção.",
    };
  }
}
