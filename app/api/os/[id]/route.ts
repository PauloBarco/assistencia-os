import { Prisma } from "../../../../generated/prisma/client";

import { recordAuditLog } from "@/lib/audit";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/http";
import { requireRequestSession } from "@/lib/route-auth";
import { validateUpdateOsInput } from "@/lib/validators";

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
    return jsonError("Identificador da ordem invalido", 400);
  }

  try {
    const body = await parseJsonBody(req);
    const input = validateUpdateOsInput(body);

    if (!input) {
      return jsonError("Dados invalidos para atualizar a ordem de servico", 400);
    }

    const os = await prisma.$transaction(async (tx) => {
      const updatedOs = await tx.ordemServico.update({
        where: { id },
        data: {
          numeroExterno: input.numero,
          origem: input.origem,
          descricao: input.descricao,
        },
      });

      await tx.equipamento.update({
        where: { ordemId: id },
        data: {
          tipo: input.tipo,
          marca: input.marca,
          modelo: input.modelo,
          serial: input.serial,
          defeito: input.defeito,
        },
      });

      return updatedOs;
    });

    await recordAuditLog({
      ordemId: id,
      entityType: "ordem_servico",
      entityId: id,
      action: "UPDATE",
      actor: auth.actor,
      details: `OS ${os.numeroExterno} atualizada`,
    });

    return Response.json(os);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Ordem de servico nao encontrada", 404);
    }

    console.error("Erro ao atualizar ordem de servico:", error);
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
    return jsonError("Identificador da ordem invalido", 400);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.evento.deleteMany({
        where: { ordemId: id },
      });

      await tx.servicoRealizado.deleteMany({
        where: { ordemId: id },
      });

      await tx.equipamento.deleteMany({
        where: { ordemId: id },
      });

      await tx.ordemServico.delete({
        where: { id },
      });
    });

    await recordAuditLog({
      ordemId: id,
      entityType: "ordem_servico",
      entityId: id,
      action: "DELETE",
      actor: auth.actor,
      details: "OS excluida com seus registros relacionados",
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Ordem de servico nao encontrada", 404);
    }

    console.error("Erro ao excluir ordem de servico:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
