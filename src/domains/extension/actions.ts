"use server";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { z } from "zod";
const authorization = z.object({
  redirectUri: z
    .string()
    .regex(/^https:\/\/[a-p]{32}\.chromiumapp\.org\/promoflow$/),
  challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});
export async function authorizeExtension(body: {
  redirectUri: string;
  challenge: string;
}): Promise<ApiResponse<{ code: string }> | ApiResponseError> {
  try {
    const parsed = authorization.parse(body);
    return await fetchServer<ApiResponse<{ code: string }>>(
      "/extension-auth/authorize",
      { method: "POST", body: parsed }
    );
  } catch {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        "Não foi possível autorizar a extensão. Confira seu login e tente novamente.",
    };
  }
}
export async function revokeExtensions(): Promise<
  ApiResponse<null> | ApiResponseError
> {
  try {
    await fetchServer("/extension-auth/connections", { method: "DELETE" });
    return {
      status: "success",
      data: null,
      message: "Conexões da extensão revogadas.",
    };
  } catch {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message: "Não foi possível revogar as conexões. Tente novamente.",
    };
  }
}
