import { fetchClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import { botStatusSchema } from "./types";
export async function getTelegramPublisherStatus() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/telegram-publisher/status",
    { cache: "no-store" }
  );
  return botStatusSchema.parse(response.data);
}
