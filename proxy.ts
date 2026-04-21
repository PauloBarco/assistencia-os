import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = getSessionFromRequest(request);
  const isLoginRoute = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth/");
  const isProtectedApi = pathname.startsWith("/api/");

  if (!session && !isLoginRoute && !isAuthApi) {
    if (isProtectedApi) {
      return Response.json({ error: "Nao autenticado" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
