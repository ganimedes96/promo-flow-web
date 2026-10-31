"use client";
import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { whatsappCollectionSourcesSchema } from "./types";
export async function getWhatsAppCollectionSources() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/collection-sources/whatsapp"
  );
  return whatsappCollectionSourcesSchema.parse(response.data);
}
