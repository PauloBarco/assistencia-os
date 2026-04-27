import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { jsonError, parseJsonBody } from "@/lib/http";
import { requireRequestSession } from "@/lib/route-auth";
import { validateCreateEventoInput } from "@/lib/validators";
import { Prisma, Status } from "../../../generated/prisma/client";

export async function POST(req: Request) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await parseJsonBody(req);
    const input = validateCreateEventoInput(body);

    if (!input) {
      return jsonError("Campos obrigatorios invalidos: ordemId, tipo e descricao", 400);
    }

    let novoStatus: Status | undefined;

    if (input.tipo === "DIAGNOSTICO") {
      novoStatus = "EM_ANALISE";
    }

    if (input.tipo === "MANUTENCAO_INTERNA") {
      novoStatus = "EM_MANUTENCAO";
    }

    if (input.tipo === "ENVIO_TERCEIRO") {
      novoStatus = "EM_TERCEIRO";
    }

    if (input.tipo === "AGUARDANDO_PECA") {
      novoStatus = "AGUARDANDO_PECA";
    }

    if (input.tipo === "FINALIZADO") {
      novoStatus = "PRONTO";
    }

    const evento = await prisma.$transaction(async (tx) => {
        const createdEvento = await tx.evento.create({
            data: {
                tipo: input.tipo,
                descricao: input.descricao,
                ordemId: input.ordemId
            },
        });

        if (novoStatus) {
            await tx.ordemServico.update({
                where: { id: input.ordemId },
                data: { statusAtual: novoStatus }
            });
        }

        return createdEvento;
    });

    await recordAuditLog({
      ordemId: input.ordemId,
      entityType: "evento",
      entityId: evento.id,
      action: "CREATE",
      actor: auth.actor,
      details: `Evento ${input.tipo} registrado`,
    });

    return Response.json(evento, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Ordem de servico nao encontrada", 404);
    }

    console.error("Erro ao criar evento:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
