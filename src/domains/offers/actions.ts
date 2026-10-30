"use server";
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { getServerSession } from "@/lib/next-auth/auth";
import {
  CreateOffer,
  CreateOffers,
  createOffersSchema,
  createOfferSchema,
  Offer,
  OfferGroupActionResult,
  ProductPreview,
  ReviseOffer,
  reviseOfferSchema,
} from "./types";
export async function createOffer(
  body: CreateOffer
): Promise<ApiResponse<Offer> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  const parsed = createOfferSchema.safeParse(body);
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      code: 400,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<Offer>>("/offers", {
      method: "POST",
      body: parsed.data,
    });
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
            : "Não foi possível salvar a oferta.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function createOffers(
  body: CreateOffers
): Promise<ApiResponse<Offer[]> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  const parsed = createOffersSchema.safeParse(body);
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      code: 400,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<Offer[]>>("/offers/batch", {
      method: "POST",
      body: parsed.data,
    });
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
            : "Não foi possível salvar a oferta.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

async function changeSchedule(
  offerId: string,
  method: "POST" | "DELETE"
): Promise<ApiResponse<Offer> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<Offer>>(
      "/offers/" + encodeURIComponent(offerId) + "/schedule",
      { method }
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
            : "Não foi possível alterar o agendamento.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}
export async function scheduleOffer(offerId: string) {
  return changeSchedule(offerId, "POST");
}
export async function cancelOfferSchedule(offerId: string) {
  return changeSchedule(offerId, "DELETE");
}

export async function deleteOffer(offerId: string): Promise<void> {
  await fetchServer("/offers/" + encodeURIComponent(offerId), {
    method: "DELETE",
  });
}

export async function reviewOffer(body: {
  offerId: string;
  attempt: number;
  outcome: "RECEIVED" | "NOT_SENT";
}): Promise<ApiResponse<Offer> | ApiResponseError> {
  try {
    return await fetchServer<ApiResponse<Offer>>(
      "/offers/" + encodeURIComponent(body.offerId) + "/review",
      {
        method: "POST",
        body: { attempt: body.attempt, outcome: body.outcome },
      }
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
            : "Não foi possível conferir o envio.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function reviseOffer(
  offerId: string,
  body: ReviseOffer
): Promise<ApiResponse<Offer> | ApiResponseError> {
  const parsed = reviseOfferSchema.safeParse(body);
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Confira os dados.",
      code: 400,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<Offer>>(
      "/offers/" + encodeURIComponent(offerId),
      { method: "PUT", body: parsed.data }
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
            : "Não foi possível editar a oferta.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function previewProduct(
  url: string
): Promise<ApiResponse<ProductPreview> | ApiResponseError> {
  const parsed = createOfferSchema.shape.sourceUrl.safeParse(url);
  if (!parsed.success)
    return {
      status: "error",
      message: "Informe um link HTTP ou HTTPS válido.",
      code: 400,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<ProductPreview>>("/offers/preview", {
      method: "POST",
      body: { url: parsed.data },
    });
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
            : "Não foi possível consultar esse produto.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

async function changeOfferGroupSchedule(
  batchId: string,
  method: "POST" | "DELETE"
): Promise<ApiResponse<OfferGroupActionResult> | ApiResponseError> {
  const session = await getServerSession();
  if (!session?.user)
    return {
      status: "error",
      message: "Faça login para continuar.",
      code: 401,
      timestamp: new Date().toISOString(),
    };
  const parsed = createOfferSchema.shape.whatsappGroupId.safeParse(batchId);
  if (!parsed.success || !parsed.data)
    return {
      status: "error",
      message: "Oferta inválida.",
      code: 400,
      timestamp: new Date().toISOString(),
    };
  try {
    return await fetchServer<ApiResponse<OfferGroupActionResult>>(
      "/offers/grouped/" + encodeURIComponent(parsed.data) + "/schedule",
      { method }
    );
  } catch (error: unknown) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível alterar os destinos da oferta.",
      code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}
export async function scheduleOfferGroup(batchId: string) {
  return changeOfferGroupSchedule(batchId, "POST");
}
export async function cancelOfferGroupSchedule(batchId: string) {
  return changeOfferGroupSchedule(batchId, "DELETE");
}
