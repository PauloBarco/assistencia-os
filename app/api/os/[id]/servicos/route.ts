import { Prisma } from "@prisma/client";

import { jsonError, parseJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { validateCreateServicoInput } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id?.trim()) {
    return jsonError("Identificador da ordem invalido", 400);
  }

  try {
    const body = await parseJsonBody(req);
    const input = validateCreateServicoInput(body);

    if (!input || input.ordemId !== id) {
      return jsonError("Dados invalidos para registrar servico", 400);
    }

    const servico = await prisma.servicoRealizado.create({
      data: {
        ordemId: input.ordemId,
        descricao: input.descricao,
        tecnico: input.tecnico,
      },
    });

    return Response.json(servico, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return jsonError("Ordem de servico nao encontrada", 404);
    }

    console.error("Erro ao registrar servico realizado:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
