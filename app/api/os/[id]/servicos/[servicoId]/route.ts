import { Prisma } from "@prisma/client";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string; servicoId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
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

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Servico realizado nao encontrado", 404);
    }

    console.error("Erro ao excluir servico realizado:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
