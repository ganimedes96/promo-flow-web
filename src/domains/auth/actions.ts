"use server";

import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { registerAccountSchema, RegisterAccount } from "./registration";
import { Auth, Credentials } from "./types";

export async function login(credentials: Credentials) {
  const { data } = await fetchServer<ApiResponse<Auth>>(
    "/auth/login",
    {
      method: "POST",
      body: credentials,
    },
    "public"
  );

  return data;
}

export async function registerAccount(
  body: RegisterAccount
): Promise<ApiResponse<{ email: string }> | ApiResponseError> {
  const parsed = registerAccountSchema.safeParse(body);
  if (!parsed.success)
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message: parsed.error.issues[0]?.message || "Confira os dados.",
    };
  try {
    const response = await fetchServer<ApiResponse<Auth>>(
      "/auth/register",
      { method: "POST", body: parsed.data },
      "public"
    );
    return {
      status: response.status,
      message: "Conta criada.",
      data: { email: response.data.user.email },
    };
  } catch (error: unknown) {
    return {
      status: "error",
      code: 400,
      timestamp: new Date().toISOString(),
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta.",
    };
  }
}
