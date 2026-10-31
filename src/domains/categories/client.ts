import { fetchClient } from "@/api/client";
import { HandleError } from "@/api/error";
import type { ApiResponse } from "@/api/types";
import { categorySchema } from "./types";
export async function getCategories() {
  const response = await fetchClient<ApiResponse<unknown>>("/categories");
  if (response.status !== "success") throw new HandleError(response.message);
  return categorySchema.array().parse(response.data);
}
