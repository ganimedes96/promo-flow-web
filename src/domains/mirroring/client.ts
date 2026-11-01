"use client";
import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { mirrorSourcesSchema, personalTelegramSchema } from "./types";
export async function getMirrorSources() {
  const response = await fetchClient<ApiResponse<unknown>>("/mirroring");
  return mirrorSourcesSchema.parse(response.data);
}

export async function getPersonalTelegram() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/mirroring/telegram"
  );
  return personalTelegramSchema.parse(response.data);
}
