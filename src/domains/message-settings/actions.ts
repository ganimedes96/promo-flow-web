"use server";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { MessageTemplate, messageTemplateSchema } from "./types";
export async function saveMessageSettings(
  body: MessageTemplate
): Promise<ApiResponse<MessageTemplate> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<MessageTemplate>>(
      "/message-settings",
      { method: "PUT", body: messageTemplateSchema.parse(body) }
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
          : "Não foi possível salvar seu padrão de mensagem.",
    };
  }
}
