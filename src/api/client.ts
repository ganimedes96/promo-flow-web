"use client";
import { signOut } from "next-auth/react";
import { HandleError } from "./error";
import { ApiResponse, ApiResponseError } from "./types";

export async function fetchClient<T>(
  path: string,
  options?: Omit<RequestInit, "body"> & { body?: object }
): Promise<T> {
  const url = "/api/backend" + path;
  const headers = {
    Accept: "application/json",

    ...options?.headers,
    ...(options?.body && { "Content-Type": "application/json" }),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
      await signOut({ callbackUrl: "/" });
      throw new HandleError({
        message: "Sessão expirada. Por favor, faça login novamente.",
        code: 401,
      });
    }

    const data: unknown = await response.json().catch(() => null);
    const payload =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : null;
    if (!response.ok || !payload) {
      const message =
        typeof payload?.message === "string"
          ? payload.message
          : response.status === 403
            ? "Você não tem permissão para esta ação."
            : response.status === 429
              ? "Muitas solicitações em pouco tempo. Aguarde um instante e tente novamente."
              : response.status >= 500
                ? "O serviço está temporariamente indisponível. Tente novamente em instantes."
                : "Não foi possível consultar os dados. Tente novamente.";
      throw new HandleError({
        message,
        code: response.ok ? 502 : response.status,
        requestId:
          typeof payload?.requestId === "string"
            ? payload.requestId
            : response.headers.get("x-request-id") || undefined,
      });
    }
    return data as T;
  } catch (error) {
    if (error instanceof HandleError) {
      throw error;
    } else {
      throw new HandleError(error as Error);
    }
  }
}

export async function handleServerActionError(
  response: ApiResponse<unknown> | ApiResponseError
) {
  if (response.status === "error") {
    throw new HandleError(response);
  }
  return;
}
