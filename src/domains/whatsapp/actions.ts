"use server";
import { z } from "zod";
import {
  connectionInputSchema,
  WhatsAppConnectionAccount,
} from "./connections";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { getServerSession } from "@/lib/next-auth/auth";
import { WhatsAppGroup, WhatsAppSession } from "./types";
async function updateConnection(
  action: "connect" | "disconnect",
  connectionId?: string
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
      connectionId
        ? "/whatsapp/connections/" +
            encodeURIComponent(connectionId) +
            "/" +
            action
        : "/whatsapp/" + action,
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
export async function connectWhatsApp(connectionId?: string) {
  return updateConnection("connect", connectionId);
}
export async function disconnectWhatsApp(connectionId?: string) {
  return updateConnection("disconnect", connectionId);
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

function connectionError(error: unknown): ApiResponseError {
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
          : "Não foi possível atualizar a conexão.",
    code: 400,
    timestamp: new Date().toISOString(),
  };
}
export async function saveWhatsAppConnection(body: {
  id?: string;
  name: string;
}): Promise<ApiResponse<WhatsAppConnectionAccount> | ApiResponseError> {
  try {
    const input = connectionInputSchema.parse(body);
    return await fetchServer<ApiResponse<WhatsAppConnectionAccount>>(
      input.id ? "/whatsapp/connections/" + input.id : "/whatsapp/connections",
      { method: input.id ? "PUT" : "POST", body: { name: input.name } }
    );
  } catch (error) {
    return connectionError(error);
  }
}
export async function updateWhatsAppConnection(body: {
  id: string;
  isDefault?: boolean;
  isPaused?: boolean;
}): Promise<ApiResponse<WhatsAppConnectionAccount> | ApiResponseError> {
  try {
    const { id, ...input } = z
      .object({
        id: z.string().uuid(),
        isDefault: z.boolean().optional(),
        isPaused: z.boolean().optional(),
      })
      .parse(body);
    return await fetchServer<ApiResponse<WhatsAppConnectionAccount>>(
      "/whatsapp/connections/" + id,
      { method: "PUT", body: input }
    );
  } catch (error) {
    return connectionError(error);
  }
}

export async function setFavoriteGroups(body: {
  groupIds: string[];
  isFavorite: boolean;
}): Promise<ApiResponse<{ updated: number }> | ApiResponseError> {
  try {
    const input = z
      .object({
        groupIds: z.array(z.string().uuid()).min(1).max(100),
        isFavorite: z.boolean(),
      })
      .parse(body);
    const ids = [...new Set(input.groupIds)];
    let updated = 0;
    for (const groupId of ids) {
      const result = await setFavoriteGroup({
        groupId,
        isFavorite: input.isFavorite,
      });
      if (result.status === "success") updated++;
    }
    if (updated !== ids.length) {
      return {
        status: "error",
        code: 400,
        timestamp: new Date().toISOString(),
        message: updated
          ? updated +
            " de " +
            ids.length +
            " grupos atualizados. A lista foi recarregada; tente novamente nos demais."
          : "Não foi possível atualizar os grupos. Confira a conexão e tente novamente.",
      };
    }
    return {
      status: "success",
      message:
        updated +
        (input.isFavorite
          ? " grupos adicionados aos favoritos."
          : " grupos removidos dos favoritos."),
      data: { updated },
    };
  } catch (error) {
    return connectionError(error);
  }
}
