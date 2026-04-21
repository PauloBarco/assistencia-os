import { prisma } from "@/lib/prisma";
import { jsonError, parseJsonBody } from "@/lib/http";
import { validateUpdateStatusInput } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
    const input = validateUpdateStatusInput(body);

    if (!input) {
      return jsonError("Dados invalidos para atualizacao de status", 400);
    }

    await prisma.ordemServico.update({
      where: { id: input.id },
      data: {
        statusAtual: input.status,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Ordem de servico nao encontrada", 404);
    }

    console.error("Erro ao atualizar status da ordem:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
