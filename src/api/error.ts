import type { ApiResponseError } from "./types";

export class HandleError extends Error {
  public readonly status: string;
  public readonly code: number;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(errorData: Partial<ApiResponseError> | string) {
    const message =
      typeof errorData === "string"
        ? normalizeMessage(errorData)
        : normalizeMessage(errorData.message || "Erro desconhecido");
    super(message.trim());

    this.name = "ApiError";
    this.requestId =
      typeof errorData === "object" ? errorData.requestId : undefined;
    this.status =
      typeof errorData === "object" ? (errorData.status ?? "error") : "error";
    this.code = typeof errorData === "object" ? (errorData.code ?? 500) : 500;
    this.timestamp =
      typeof errorData === "object"
        ? (errorData.timestamp ?? new Date().toISOString())
        : new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HandleError);
    }
  }
}

function normalizeMessage(message: string) {
  switch (message) {
    case "Failed to fetch":
    case "NetworkError when attempting to fetch resource.":
      return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.";
    case "Unauthorized":
      return "Sua sessão expirou. Faça login novamente.";
    case "The operation was aborted due to timeout":
    case "The operation was aborted.":
      return "O servidor demorou para responder. Aguarde um instante e tente novamente.";
    case "fetch failed":
      return "Não foi possível conectar ao servidor. Verifique sua conexão!";
    default:
      return message;
  }
}
