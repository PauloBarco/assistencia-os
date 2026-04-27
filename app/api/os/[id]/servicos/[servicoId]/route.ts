import { Prisma } from "../../../../../generated/prisma/client";

import { recordAuditLog } from "@/lib/audit";
import { jsonError, parseJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireRequestSession } from "@/lib/route-auth";
import { validateUpdateServicoInput } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string; servicoId: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  const { id, servicoId } = await context.params;

  if (!id?.trim() || !servicoId?.trim()) {
    return jsonError("Identificadores invalidos para atualizar servico", 400);
  }

  try {
    const body = await parseJsonBody(req);
    const input = validateUpdateServicoInput(body);

    if (!input) {
      return jsonError("Dados invalidos para atualizar servico", 400);
    }

    const servico = await prisma.servicoRealizado.findUnique({
      where: { id: servicoId },
      select: { id: true, ordemId: true },
    });

    if (!servico || servico.ordemId !== id) {
      return jsonError("Servico realizado nao encontrado para esta ordem", 404);
    }

    const updatedServico = await prisma.servicoRealizado.update({
      where: { id: servicoId },
      data: {
        descricao: input.descricao,
        tecnico: input.tecnico,
      },
    });

    await recordAuditLog({
      ordemId: id,
      entityType: "servico",
      entityId: updatedServico.id,
      action: "UPDATE",
      actor: auth.actor,
      details: "Servico realizado atualizado",
    });

    return Response.json(updatedServico);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Servico realizado nao encontrado", 404);
    }

    console.error("Erro ao atualizar servico realizado:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  const { id, servicoId } = await context.params;

  if (!id?.trim() || !servicoId?.trim()) {
    return jsonError("Identificadores invalidos para excluir servico", 400);
  }

  try {
    const servico = await prisma.servicoRealizado.findUnique({
      where: { id: servicoId },
      select: { id: true, ordemId: true },
    });

    if (!servico || servico.ordemId !== id) {
      return jsonError("Servico realizado nao encontrado para esta ordem", 404);
    }

    await prisma.servicoRealizado.delete({
      where: { id: servicoId },
    });

    await recordAuditLog({
      ordemId: id,
      entityType: "servico",
      entityId: servicoId,
      action: "DELETE",
      actor: auth.actor,
      details: "Servico realizado removido",
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Servico realizado nao encontrado", 404);
    }

    console.error("Erro ao excluir servico realizado:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
