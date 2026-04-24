import { NextRequest } from "next/server";

import { jsonError, parseJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = getSessionFromRequest(req);
  
  if (!session || !session.isAdmin) {
    return jsonError("Nao autorizado", 401);
  }

  try {
    const { id } = await params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, username: true, nome: true, isAdmin: true, createdAt: true, updatedAt: true },
    });

    if (!usuario) {
      return jsonError("Usuario nao encontrado", 404);
    }

    return Response.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuario:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = getSessionFromRequest(req);
  
  if (!session || !session.isAdmin) {
    return jsonError("Nao autorizado", 401);
  }

  try {
    const { id } = await params;
    const body = await parseJsonBody(req);

    const nome = typeof body === "object" && body !== null && "nome" in body ? String(body.nome) : null;
    const password = typeof body === "object" && body !== null && "password" in body ? String(body.password) : null;
    const isAdmin = typeof body === "object" && body !== null && "isAdmin" in body ? Boolean(body.isAdmin) : null;

    // Verificar se usuario existe
    const existing = await prisma.usuario.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Usuario nao encontrado", 404);
    }

    const updateData: { nome?: string; password?: string; isAdmin?: boolean } = {};
    
    if (nome) updateData.nome = nome;
    if (password) updateData.password = password;
    if (isAdmin !== null && isAdmin !== undefined) updateData.isAdmin = isAdmin;

    if (Object.keys(updateData).length === 0) {
      return jsonError("Nenhum campo para atualizar", 400);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, nome: true, isAdmin: true, createdAt: true, updatedAt: true },
    });

    return Response.json(usuario);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    console.error("Erro ao atualizar usuario:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = getSessionFromRequest(req);
  
  if (!session || !session.isAdmin) {
    return jsonError("Nao autorizado", 401);
  }

  try {
    const { id } = await params;

    // Verificar se usuario existe
    const existing = await prisma.usuario.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Usuario nao encontrado", 404);
    }

    // Impedir auto-exclusão
    if (existing.username === session.username) {
      return jsonError("Nao e permitido excluir a si mesmo", 400);
    }

    await prisma.usuario.delete({ where: { id } });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir usuario:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}