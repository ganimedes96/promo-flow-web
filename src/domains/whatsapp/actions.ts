"use server";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { getServerSession } from "@/lib/next-auth/auth";
import { WhatsAppGroup, WhatsAppSession } from "./types";
async function updateConnection(
  action: "connect" | "disconnect"
): Promise<ApiResponse<WhatsAppSession> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<WhatsAppSession>>(
      "/whatsapp/" + action,
      { method: "POST" }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
          ? error.message
          : "Não foi possível atualizar a conexão.";
    return {
      status: "error",
      message,
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}
export async function connectWhatsApp() {
  return updateConnection("connect");
}
export async function disconnectWhatsApp() {
  return updateConnection("disconnect");
}

export async function setTargetGroup(body: {
  groupId: string;
}): Promise<ApiResponse<WhatsAppGroup> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<WhatsAppGroup>>(
      "/whatsapp/target-group",
      { method: "PUT", body }
    );
  } catch (error: unknown) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Não foi possível salvar o grupo.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function setFavoriteGroup(body: {
  groupId: string;
  isFavorite: boolean;
}): Promise<ApiResponse<WhatsAppGroup> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<WhatsAppGroup>>(
      "/whatsapp/groups/" + encodeURIComponent(body.groupId) + "/favorite",
      { method: "PUT", body: { isFavorite: body.isFavorite } }
    );
  } catch (error: unknown) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Não foi possível atualizar o favorito.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}
