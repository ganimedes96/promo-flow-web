"use server";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import { botLinkSchema, type BotLink } from "./types";
export async function createTelegramPublisherLink(): Promise<
  ApiResponse<BotLink> | ApiResponseError
> {
  try {
    const response = await fetchServer<ApiResponse<BotLink>>(
      "/telegram-publisher/link",
      { method: "POST" }
    );
    if (response.status === "success") botLinkSchema.parse(response.data);
    return response;
  } catch (error) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Não foi possível preparar o vínculo com Telegram.",
    };
  }
}
