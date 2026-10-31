import { getApiBaseUrl } from "./config";
import { authOptions } from "@/lib/next-auth/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ApiResponseError } from "./types";
import { HandleError } from "./error";

export async function fetchServer<T>(
  path: string,
  options?: Omit<RequestInit, "body"> & { body?: object },
  authentication: "required" | "public" = "required"
) {
  const session =
    authentication === "required" ? await getServerSession(authOptions) : null;
  const jwt = session?.user?.token || "";
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers = {
    Accept: "application/json",
    ...(jwt && { Authorization: `Bearer ${jwt}` }),
    ...options?.headers,
    ...(options?.body && { "Content-Type": "application/json" }),
  };

  const response = await fetch(url, {
    headers,
    ...options,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  }).catch((e) => {
    console.error("Fetch error:", e);

    throw new HandleError({
      message:
        "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
      status: "error",
      code: 500,
      timestamp: new Date().toISOString(),
    });
  });

  const data: T = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      if (jwt) {
        redirect("/unauthorized");
      }
    }
    const errorData = data as ApiResponseError;
    if (options?.method !== "GET") {
      throw {
        message: errorData?.message,
        status: errorData?.status,
        code: errorData?.code,
        timestamp: new Date().toISOString(),
      };
    }
    throw new HandleError({
      message: errorData?.message || "Erro ao processar a requisição.",
      status: errorData?.status || "error",
      code: errorData?.code || response.status,
      timestamp: new Date().toISOString(),
    });
  }

  return data;
}
