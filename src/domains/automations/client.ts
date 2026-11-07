import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import type { ApiResponse } from "@/api/types";
import { automationSchema } from "./types";

export async function getAutomation() {
  const response = await fetchClient<ApiResponse<unknown>>("/automations");
  if (response.status !== "success") throw new HandleError(response.message);
  return automationSchema.parse(response.data);
}
