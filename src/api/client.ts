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
      await signOut();
      throw new HandleError({
        message: "Sessão expirada. Por favor, faça login novamente.",
        code: 401,
      });
    }

    if (response.status === 403) {
      throw new HandleError({
        message:
          "Você não tem permissão para acessar este recurso. Contate o administrador.",
        code: 403,
      });
    }

    const data = await response.json();
    if (!response.ok)
      throw new HandleError({
        message: data?.message || "Não foi possível consultar os dados.",
        code: response.status,
      });
    return data as T;
  } catch (error) {
    if (error instanceof HandleError) {
      throw new HandleError({
        message: error.message,
        status: error.status,
        code: error.code,
        timestamp: error.timestamp,
      });
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
