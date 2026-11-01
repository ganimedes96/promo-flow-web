import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { messageTemplateSchema } from "./types";
export async function getMessageSettings() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/message-settings",
    { cache: "no-store" }
  );
  return messageTemplateSchema.parse(response.data);
}
