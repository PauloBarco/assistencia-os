import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const os = await prisma.ordemServico.create({
    data: {
      numeroExterno: body.numero,
      origem: body.origem,
      descricao: body.descricao,

      equipamento: {
        create: {
          tipo: body.tipo,
          marca: body.marca,
          modelo: body.modelo,
          defeito: body.defeito,
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

    return Response.json(os);
}
export async function GET() {
    const ordens = await prisma.ordemServico.findMany({
      include: {
        equipamento: true,},
        orderBy: {
          createdAt: "desc",
        },
      });

      return Response.json(ordens);
}

export async function GET() {
  const os = await prisma.ordemServico.findMany({
    include: {
      equipamento: true,
      eventos: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(os);
}