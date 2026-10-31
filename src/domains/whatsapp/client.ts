import { connectionListSchema } from "./connections";
import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import { ApiResponse } from "@/api/types";
import { groupSchema, sessionSchema } from "./types";
export async function getWhatsAppSession(connectionId?: string) {
  const response = await fetchClient<ApiResponse<unknown>>(
    connectionId
      ? "/whatsapp/connections/" + encodeURIComponent(connectionId)
      : "/whatsapp/session",
    { cache: "no-store" }
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return sessionSchema.parse(response.data);
}
export async function getWhatsAppGroups(connectionId?: string) {
  const response = await fetchClient<ApiResponse<unknown>>(
    connectionId
      ? "/whatsapp/connections/" + encodeURIComponent(connectionId) + "/groups"
      : "/whatsapp/groups",
    {
      cache: "no-store",
    }
  );
  if (response.status !== "success") throw new HandleError(response.message);
  return groupSchema.array().parse(response.data);
}

export async function getWhatsAppConnections() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/whatsapp/connections",
    { cache: "no-store" }
  );
  return connectionListSchema.parse(response.data);
}
