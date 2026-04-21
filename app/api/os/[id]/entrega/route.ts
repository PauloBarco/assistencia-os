import { jsonError, parseJsonBody } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { validateDeliverOsInput } from "@/lib/validators";

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
    const input = validateDeliverOsInput(body);

    if (!input) {
      return jsonError("Dados invalidos para registrar entrega", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const ordem = await tx.ordemServico.findUnique({
        where: { id },
        select: { id: true, statusAtual: true, numeroExterno: true },
      });

      if (!ordem) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (ordem.statusAtual === "ENTREGUE") {
        throw new Error("ORDER_ALREADY_DELIVERED");
      }

      await tx.ordemServico.update({
        where: { id },
        data: { statusAtual: "ENTREGUE" },
      });

      const descricao = input.observacao
        ? `Equipamento entregue ao cliente. ${input.observacao}`
        : "Equipamento entregue ao cliente.";

      const evento = await tx.evento.create({
        data: {
          ordemId: id,
          tipo: "ATUALIZACAO",
          descricao,
        },
      });

      return { ordem, evento };
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return jsonError("Ordem de servico nao encontrada", 404);
    }

    if (error instanceof Error && error.message === "ORDER_ALREADY_DELIVERED") {
      return jsonError("Esta ordem ja foi marcada como entregue", 409);
    }

    console.error("Erro ao registrar entrega da ordem:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
