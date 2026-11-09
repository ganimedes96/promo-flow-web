import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiBaseUrl } from "@/api/config";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ action: string }> };
const exchangeSchema = z
  .object({
    code: z.string().regex(/^[a-f0-9]{64}$/),
    challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    verifier: z
      .string()
      .min(43)
      .max(128)
      .regex(/^[A-Za-z0-9._~-]+$/),
    redirectUri: z
      .string()
      .regex(/^https:\/\/[a-p]{32}\.chromiumapp\.org\/promoflow$/),
  })
  .strict();

function failure(message: string, status: number) {
  return NextResponse.json(
    { status: "error", message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}
async function forward(request: NextRequest, context: Context) {
  const { action } = await context.params;
  const exchange = action === "exchange" && request.method === "POST";
  const conversion =
    ["conversion-claim", "conversion-result"].includes(action) &&
    request.method === "POST";
  const authenticated =
    (["me", "stores"].includes(action) && request.method === "GET") ||
    (action === "current" && request.method === "DELETE");
  if (!exchange && !authenticated && !conversion)
    return failure("Recurso não disponível.", 404);
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: string | undefined;
  if (exchange) {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return failure("Use dados em JSON.", 415);
    const raw = await request.text();
    if (raw.length > 4096) return failure("Solicitação inválida.", 413);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return failure("Solicitação inválida.", 400);
    }
    const result = exchangeSchema.safeParse(parsed);
    if (!result.success)
      return failure(
        "Autorização inválida. Conecte novamente pela extensão.",
        400
      );
    body = JSON.stringify(result.data);
    headers["Content-Type"] = "application/json";
  } else {
    const authorization = request.headers.get("authorization") ?? "";
    if (!/^Bearer [a-f0-9]{64}$/.test(authorization))
      return failure("Conecte a extensão ao PromoFlow novamente.", 401);
    headers.Authorization = authorization;
    const capabilities = (request.headers.get("x-extension-capabilities") || "").split(",").filter((item) => ["shopee-affiliate-v1", "amazon-affiliate-v1"].includes(item));
    if (capabilities.length) headers["x-extension-capabilities"] = capabilities.join(",");
    if (conversion) {
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        return failure("Use dados em JSON.", 415);
      const raw = await request.text();
      if (raw.length > 4096) return failure("Solicitação inválida.", 413);
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return failure("Solicitação inválida.", 400);
      }
      const schema =
        action === "conversion-claim"
          ? z.object({ offerId: z.string().uuid().optional() }).strict()
          : z
              .object({
                offerId: z.string().uuid(),
                leaseId: z.string().uuid(),
                outcome: z.enum(["SUCCESS", "FAILED", "RECONNECT"]),
                affiliateUrl: z.string().url().max(2048).optional(),
                errorCode: z.enum(["PRODUCT_NOT_FOUND", "MULTIPLE_PRODUCTS", "CAMPAIGN_INVALID", "GENERATOR_FORM", "GENERATOR_TIMEOUT", "GENERATION_FAILED"]).optional(),
                sourceCategory: z.string().max(120).optional(),
                affiliateCommissionRate: z.number().min(0).max(100).multipleOf(0.01).optional(),
              })
              .strict();
      const validated = schema.safeParse(parsed);
      if (!validated.success)
        return failure("Dados de conversão inválidos.", 400);
      body = JSON.stringify(validated.data);
      headers["Content-Type"] = "application/json";
    }
  }
  try {
    const response = await fetch(
      getApiBaseUrl() + "/extension-auth/" + action,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!response.headers.get("content-type")?.includes("application/json"))
      return failure("A API não está disponível. Tente novamente.", 502);
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return failure(
      "O site não conseguiu acessar a API configurada. Confira a conexão do frontend com o servidor.",
      502
    );
  }
}
export const GET = forward;
export const POST = forward;
export const DELETE = forward;
