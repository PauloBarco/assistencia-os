import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { jsonError, parseJsonBody } from "@/lib/http";
import { requireRequestSession } from "@/lib/route-auth";
import { validateCreateOsInput } from "@/lib/validators";
import { Prisma } from "../../../generated/prisma/client";

export async function POST(req: Request) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const body = await parseJsonBody(req);
    const input = validateCreateOsInput(body);

    if (!input) {
      return jsonError("Dados invalidos para criar a ordem de servico", 400);
    }

    const os = await prisma.ordemServico.create({
      data: {
        numeroExterno: input.numero,
        origem: input.origem,
        descricao: input.descricao,

        equipamento: {
          create: {
            tipo: input.tipo,
            marca: input.marca,
            modelo: input.modelo,
            defeito: input.defeito,
          },
        },

        eventos: {
          create: {
            tipo: "RECEBIMENTO",
            descricao: "Equipamento recebido na assistência",
          },
        },
      },
      include: {
        equipamento: true,
        eventos: true,
      },
    });

    await recordAuditLog({
      ordemId: os.id,
      entityType: "ordem_servico",
      entityId: os.id,
      action: "CREATE",
      actor: auth.actor,
      details: `OS ${os.numeroExterno} criada`,
    });

    return Response.json(os, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError("Nao foi possivel criar a ordem de servico", 400);
    }

    console.error("Erro ao criar ordem de servico:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}

export async function GET(req: Request) {
  const auth = requireRequestSession(req);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const ordens = await prisma.ordemServico.findMany({
      select: {
        id: true,
        numeroExterno: true,
        origem: true,
        statusAtual: true,
        createdAt: true,
        equipamento: {
          select: {
            marca: true,
            modelo: true,
            tipo: true,
          },
        },
        eventos: {
          select: {
            id: true,
            tipo: true,
            descricao: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(ordens);
  } catch (error) {
    console.error("Erro ao listar ordens de servico:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
