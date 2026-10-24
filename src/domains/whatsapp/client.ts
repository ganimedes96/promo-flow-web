import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import { ApiResponse } from "@/api/types";
import { groupSchema, sessionSchema } from "./types";
export async function getWhatsAppSession() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/whatsapp/session",
    { cache: "no-store" }
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return sessionSchema.parse(response.data);
}
export async function getWhatsAppGroups() {
  const response = await fetchClient<ApiResponse<unknown>>("/whatsapp/groups", {
    cache: "no-store",
  });
  if (response.status !== "success") throw new HandleError(response.message);
  return groupSchema.array().parse(response.data);
}
