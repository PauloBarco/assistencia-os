import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { jsonError, parseJsonBody } from "@/lib/http";
import { requireRequestSession } from "@/lib/route-auth";
import { validateUpdateStatusInput } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

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

    await recordAuditLog({
      ordemId: input.id,
      entityType: "ordem_servico",
      entityId: input.id,
      action: "STATUS_UPDATE",
      actor: auth.actor,
      details: `Status alterado para ${input.status}`,
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
