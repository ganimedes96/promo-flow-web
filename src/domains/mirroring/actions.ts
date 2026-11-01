"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
async function mutate(
  path: string,
  method: "PATCH" | "PUT" | "DELETE" | "POST",
  body?: object
): Promise<ApiResponse<unknown> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<unknown>>(path, {
      method,
      ...(body ? { body } : {}),
    });
  } catch (error) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Não foi possível atualizar o espelhamento.",
    };
  }
}
export async function updateMirrorSource(body: {
  id: string;
  enabled: boolean;
}) {
  return mutate(
    "/mirroring/sources/" + z.string().uuid().parse(body.id),
    "PATCH",
    { enabled: z.boolean().parse(body.enabled) }
  );
}
export async function removeMirrorSource(id: string) {
  return mutate("/mirroring/sources/" + z.string().uuid().parse(id), "DELETE");
}
export async function applyMirrorAffiliate(body: {
  id: string;
  affiliateUrl: string;
  confirmed: boolean;
}) {
  return mutate(
    "/mirroring/offers/" + z.string().uuid().parse(body.id) + "/affiliate",
    "PUT",
    {
      affiliateUrl: z.string().url().max(2048).parse(body.affiliateUrl),
      confirmed: z.literal(true).parse(body.confirmed),
    }
  );
}
export async function assignMirrorDestination(body: {
  id: string;
  groupId: string;
}) {
  return mutate(
    "/mirroring/offers/" + z.string().uuid().parse(body.id) + "/destination",
    "PUT",
    { groupId: z.string().uuid().parse(body.groupId) }
  );
}

export async function retryMirrorConversion(id: string) {
  return mutate(
    "/mirroring/offers/" + z.string().uuid().parse(id) + "/retry",
    "POST"
  );
}
