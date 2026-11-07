"use server";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import { automationSchema, type Automation } from "./types";

export async function saveAutomation(
  body: Automation
): Promise<ApiResponse<Automation> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<Automation>>("/automations", {
      method: "PUT",
      body: automationSchema.parse(body),
    });
  } catch (error) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a automação.",
    };
  }
}
