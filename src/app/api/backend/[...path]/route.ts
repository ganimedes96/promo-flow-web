import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/next-auth/auth";
import { getApiBaseUrl } from "@/api/config";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
function failure(message: string, status: number) {
  return NextResponse.json(
    {
      status: "error",
      message,
      code: status,
      timestamp: new Date().toISOString(),
    },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}
async function forward(request: NextRequest, context: Context) {
  const segments = (await context.params).path;
  if (
    segments.length > 6 ||
    segments.some((segment) => !/^[-a-zA-Z0-9_]+$/.test(segment))
  )
    return failure("Recurso inválido.", 400);
  const path = "/" + segments.join("/");
  const readOnly =
    /^\/(?:categories|billing\/(?:access|plans)|offers(?:\/(?:grouped|filter-groups))?|promotions(?:\/manage)?|users|whatsapp\/(?:session|groups|connections(?:\/[a-fA-F0-9-]{36}(?:\/groups)?)?))$/.test(
      path
    );
  const duplicateLookup =
    request.method === "POST" && path === "/offers/duplicates";
  if (!(request.method === "GET" && readOnly) && !duplicateLookup)
    return failure("Recurso não disponível.", 404);
  if (
    duplicateLookup &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return failure("Origem inválida.", 403);
  const session = await getServerSession();
  const token = session?.user?.token;
  if (!token) return failure("Sua sessão expirou. Faça login novamente.", 401);
  let body: string | undefined;
  if (duplicateLookup) {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return failure("Use dados em JSON.", 415);
    body = await request.text();
    if (body.length > 6000) return failure("Dados muito grandes.", 413);
  }
  try {
    const upstream = await fetch(
      getApiBaseUrl() + path + request.nextUrl.search,
      {
        method: request.method,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + token,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!upstream.headers.get("content-type")?.includes("application/json"))
      return failure(
        "A API não está disponível. Tente novamente em instantes.",
        502
      );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return failure(
      "Não foi possível consultar a API. Tente novamente em instantes.",
      502
    );
  }
}
export async function GET(request: NextRequest, context: Context) {
  return forward(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  return forward(request, context);
}
