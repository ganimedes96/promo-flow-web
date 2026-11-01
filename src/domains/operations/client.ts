import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import {
  operationsSchema,
  supportUserSchema,
  supportSchema,
  type SupportFilters,
} from "./types";
export async function getOperationsStatus() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/operations/status",
    { cache: "no-store" }
  );
  return operationsSchema.parse(response.data);
}

export async function getSupportUsers(search: string) {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/operations/users?search=" + encodeURIComponent(search),
    { cache: "no-store" }
  );
  return supportUserSchema.array().parse(response.data);
}
export async function getSupportDetails(filters: SupportFilters) {
  const params = new URLSearchParams({
    userId: filters.userId,
    page: String(filters.page),
    errorPage: String(filters.errorPage),
    ...(filters.status ? { status: filters.status } : {}),
  });
  const response = await fetchClient<ApiResponse<unknown>>(
    "/operations/support?" + params,
    { cache: "no-store" }
  );
  return supportSchema.parse(response.data);
}
