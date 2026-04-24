import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { prisma } from "./prisma";

const AUTH_COOKIE_NAME = "assistencia_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export type SessionPayload = {
  username: string;
  isAdmin: boolean;
  exp: number;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }

  return value;
}

function getSessionSecret() {
  return getRequiredEnv("SESSION_SECRET");
}

/**
 * Busca usuário no banco pelo username e verifica a senha
 */
export async function authenticateUser(username: string, password: string) {
  const user = await prisma.usuario.findUnique({
    where: { username },
    select: { id: true, username: true, password: true, nome: true, isAdmin: true },
  });

  if (!user) {
    return null;
  }

  // Verificar senha hashada ou senha plana (para compatibilidade com dados antigos)
  const isValid = user.password === password || user.password === `plain:${password}`;
  if (!isValid) {
    return null;
  }

  return { username: user.username, nome: user.nome, isAdmin: user.isAdmin };
}

/**
 * Busca usuário pelo ID para verificar sessão
 */
export async function getUserByUsername(username: string) {
  return prisma.usuario.findUnique({
    where: { username },
    select: { id: true, username: true, nome: true, isAdmin: true },
  });
}

export function getConfiguredUsername() {
  return getRequiredEnv("APP_ADMIN_USERNAME");
}

export function getConfiguredPassword() {
  return getRequiredEnv("APP_ADMIN_PASSWORD");
}

export function isUsingPlaceholderAuthConfig() {
  return (
    process.env.APP_ADMIN_PASSWORD === "troque-esta-senha" ||
    process.env.SESSION_SECRET === "troque-esta-chave-de-sessao"
  );
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function parseCookieHeader(cookieHeader?: string | null) {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");
        const key = separatorIndex >= 0 ? entry.slice(0, separatorIndex).trim() : entry.trim();
        const value = separatorIndex >= 0 ? entry.slice(separatorIndex + 1).trim() : "";

        return [key, value];
      })
  );
}

export function createSessionToken(username: string, isAdmin: boolean = false) {
  const payload = base64UrlEncode(
    JSON.stringify({
      username,
      isAdmin,
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    } satisfies SessionPayload)
  );

  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as SessionPayload;

    if (!decoded.username || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function getSessionFromCookieHeader(cookieHeader?: string | null) {
  return verifySessionToken(parseCookieHeader(cookieHeader).get(AUTH_COOKIE_NAME));
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function setSessionCookie(username: string, isAdmin: boolean = false) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, createSessionToken(username, isAdmin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function getSessionFromRequest(request: NextRequest | Request) {
  if ("cookies" in request && typeof request.cookies?.get === "function") {
    return verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  }

  return getSessionFromCookieHeader(request.headers.get("cookie"));
}
