"use client";
import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { telegramStateSchema } from "./types";
export async function getTelegramState() {
  const result = await fetchClient<ApiResponse<unknown>>("/telegram");
  return telegramStateSchema.parse(result.data);
}
