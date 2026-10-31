"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
export async function updateWhatsAppCollectionSource(body: {
  id: string;
  enabled: boolean;
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    const { id, enabled } = z
      .object({ id: z.string().uuid(), enabled: z.boolean() })
      .parse(body);
    return await fetchServer<ApiResponse<unknown>>(
      `/collection-sources/whatsapp/${id}`,
      { method: "PATCH", body: { enabled } }
    );
  } catch (error: unknown) {
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
          : "Não foi possível atualizar a fonte.",
    };
  }
}
