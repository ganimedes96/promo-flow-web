import { fetchClient } from "@/api/client";
import { ApiResponse } from "@/api/types";
import { operationsSchema } from "./types";
export async function getOperationsStatus() {
  const response = await fetchClient<ApiResponse<unknown>>(
    "/operations/status",
    { cache: "no-store" }
  );
  return operationsSchema.parse(response.data);
}
