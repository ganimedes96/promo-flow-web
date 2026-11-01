import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import { ApiResponse } from "@/api/types";
import { storeSchema } from "./types";
export async function getStores() {
  const response = await fetchClient<ApiResponse<unknown>>("/stores", {
    cache: "no-store",
  });
  if (response.status !== "success") throw new HandleError(response.message);
  return storeSchema.array().parse(response.data);
}
