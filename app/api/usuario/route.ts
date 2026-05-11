import { NextRequest } from "next/server";

import { jsonError, parseJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/route-auth";
import {
  readBooleanValue,
  readPermissionsFromPayload,
  USER_PERMISSION_SELECT,
} from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const auth = requirePermission(req, "canManageUsers");

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        nome: true,
        isAdmin: true,
        ...USER_PERMISSION_SELECT,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = requirePermission(req, "canManageUsers");

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await parseJsonBody(req);

    const username = typeof body === "object" && body !== null && "username" in body ? String(body.username) : "";
    const password = typeof body === "object" && body !== null && "password" in body ? String(body.password) : "";
    const nome = typeof body === "object" && body !== null && "nome" in body ? String(body.nome) : "";
    const isAdmin =
      typeof body === "object" && body !== null && "isAdmin" in body
        ? readBooleanValue(body.isAdmin) ?? false
        : false;
    const permissions = readPermissionsFromPayload(body, isAdmin);

    if (!username.trim() || !password || !nome.trim()) {
      return jsonError("Username, senha e nome sao obrigatorios", 400);
    }

    // Verificar se username já existe
    const existing = await prisma.usuario.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return jsonError("Username ja existe", 400);
    }

    const usuario = await prisma.usuario.create({
      data: {
        username: username.trim(),
        password,
        nome: nome.trim(),
        isAdmin,
        ...permissions,
      },
      select: {
        id: true,
        username: true,
        nome: true,
        isAdmin: true,
        ...USER_PERMISSION_SELECT,
        createdAt: true,
      },
    });

    return Response.json(usuario);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    console.error("Erro ao criar usuario:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
