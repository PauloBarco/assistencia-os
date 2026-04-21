process.env.APP_ADMIN_USERNAME ??= "admin";
process.env.APP_ADMIN_PASSWORD ??= "senha-de-teste";
process.env.SESSION_SECRET ??= "segredo-de-teste-super-seguro";

import { createSessionToken } from "@/lib/auth";

export function authenticatedHeaders(headers?: HeadersInit, username = process.env.APP_ADMIN_USERNAME ?? "admin") {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("cookie", `assistencia_session=${createSessionToken(username)}`);
  return nextHeaders;
}

export function authenticatedRequest(url: string, init: RequestInit = {}, username?: string) {
  return new Request(url, {
    ...init,
    headers: authenticatedHeaders(init.headers, username),
  });
}
