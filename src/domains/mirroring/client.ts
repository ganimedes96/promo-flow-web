"use client";
import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { mirrorSourcesSchema } from "./types";
export async function getMirrorSources() {
  const response = await fetchClient<ApiResponse<unknown>>("/mirroring");
  return mirrorSourcesSchema.parse(response.data);
}
