"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
function failure(error: unknown): ApiResponseError {
  return {
    status: "error",
    code: 400,
    timestamp: new Date().toISOString(),
    message:
      error instanceof Error
        ? error.message
        : "Não foi possível atualizar o Telegram.",
  };
}
export async function controlTelegram(body: {
  action: "connect" | "disconnect" | "sync";
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    const action = z.enum(["connect", "disconnect", "sync"]).parse(body.action);
    return await fetchServer<ApiResponse<unknown>>(`/telegram/${action}`, {
      method: "POST",
    });
  } catch (error: unknown) {
    return failure(error);
  }
}
export async function sendTelegramPassword(body: {
  flowId: string;
  password: string;
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    const parsed = z
      .object({
        flowId: z.string().uuid(),
        password: z.string().min(1).max(256),
      })
      .parse(body);
    return await fetchServer<ApiResponse<unknown>>("/telegram/password", {
      method: "POST",
      body: parsed,
    });
  } catch (error: unknown) {
    return failure(error);
  }
}
export async function updateTelegramSource(body: {
  id: string;
  enabled: boolean;
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    const { id, enabled } = z
      .object({ id: z.string().uuid(), enabled: z.boolean() })
      .parse(body);
    return await fetchServer<ApiResponse<unknown>>(`/telegram/sources/${id}`, {
      method: "PATCH",
      body: { enabled },
    });
  } catch (error: unknown) {
    return failure(error);
  }
}
export async function removeTelegramSource(body: {
  id: string;
}): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    const id = z.string().uuid().parse(body.id);
    return await fetchServer<ApiResponse<unknown>>(`/telegram/sources/${id}`, {
      method: "DELETE",
    });
  } catch (error: unknown) {
    return failure(error);
  }
}
