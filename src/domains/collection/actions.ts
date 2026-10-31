"use server";
import {
  connectWhatsApp,
  saveWhatsAppConnection,
} from "@/domains/whatsapp/actions";
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

export async function removeWhatsAppCollectionSource(body: {
  id: string;
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    const id = z.string().uuid().parse(body.id);
    return await fetchServer<ApiResponse<unknown>>(
      `/collection-sources/whatsapp/${id}`,
      { method: "DELETE" }
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
          : "Não foi possível remover a fonte.",
    };
  }
}
export async function connectWhatsAppSource(body: {
  id?: string;
}): Promise<ApiResponse<{ id: string }> | ApiResponseError> {
  let id = body.id;
  if (id && !z.string().uuid().safeParse(id).success)
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message: "Conta inválida.",
    };
  if (!id) {
    const created = await saveWhatsAppConnection({
      name: "Curadoria de promoções",
    });
    if (!("data" in created)) return created;
    id = created.data.id;
  }
  const result = await connectWhatsApp(id);
  if (!("data" in result)) return result;
  return { ...result, data: { id } };
}
