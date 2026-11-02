"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import {
  planCodes,
  planInputSchema,
  type ManagedPlan,
  type PlanInput,
} from "./types";
export async function savePlan(input: {
  code: ManagedPlan["code"];
  body: PlanInput;
}): Promise<ApiResponse<ManagedPlan> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<ManagedPlan>>(
      "/plans/" + z.enum(planCodes).parse(input.code),
      { method: "PUT", body: planInputSchema.parse(input.body) }
    );
  } catch (error) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Não foi possível salvar o plano.",
    };
  }
}
