import { recordAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

import { jsonError, parseJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireRequestSession } from "@/lib/route-auth";
import { validateUpdateEventoInput } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;

  if (!id?.trim()) {
    return jsonError("Identificador do evento invalido", 400);
  }

  try {
    const body = await parseJsonBody(req);
    const input = validateUpdateEventoInput(body);

    if (!input) {
      return jsonError("Dados invalidos para atualizar evento", 400);
    }

    const evento = await prisma.evento.update({
      where: { id },
      data: {
        descricao: input.descricao,
      },
    });

    await recordAuditLog({
      ordemId: evento.ordemId,
      entityType: "evento",
      entityId: evento.id,
      action: "UPDATE",
      actor: auth.actor,
      details: "Descricao de evento atualizada",
    });

    return Response.json(evento);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Evento nao encontrado", 404);
    }

    console.error("Erro ao atualizar evento:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;

  if (!id?.trim()) {
    return jsonError("Identificador do evento invalido", 400);
  }

  try {
    const deletedEvento = await prisma.evento.delete({
      where: { id },
    });

    await recordAuditLog({
      ordemId: deletedEvento.ordemId,
      entityType: "evento",
      entityId: deletedEvento.id,
      action: "DELETE",
      actor: auth.actor,
      details: "Evento removido do historico",
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Evento nao encontrado", 404);
    }

    console.error("Erro ao excluir evento:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
