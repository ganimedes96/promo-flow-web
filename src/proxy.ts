import { getToken } from "next-auth/jwt";
import {
  NextResponse,
  type MiddlewareConfig,
  type NextRequest,
} from "next/server";

type PublicRoute = {
  path: string;
  whenAuthed: "redirect" | "not-redirect";
};

const publicRoutes: PublicRoute[] = [
  { path: "/login", whenAuthed: "redirect" },
  { path: "/import-product", whenAuthed: "not-redirect" },
  { path: "/register", whenAuthed: "redirect" },
  { path: "/", whenAuthed: "not-redirect" },
  { path: "/policy-and-privacy", whenAuthed: "not-redirect" },
  { path: "/terms", whenAuthed: "not-redirect" },
] as const;

const REDIRECT_WHEN_UNAUTHED = "/login";

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => {
    return path === route.path;
  });

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Usuário não autenticado
  if (!token) {
    if (publicRoute) {
      return NextResponse.next();
    } else {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_UNAUTHED;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Usuário autenticado em rota pública que deve redirecionar
  if (publicRoute && publicRoute.whenAuthed === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      path === "/login" &&
      request.nextUrl.searchParams.get("import") === "product"
        ? "/import-product"
        : "/control-panel";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: ["/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|og.png).*)"],
};
