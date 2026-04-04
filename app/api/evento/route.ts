import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const body = await req.json();

    const evento = await prisma.evento.create({
        data: {
            tipo: body.tipo,
            descricao: body.descricao,
            ordemId: body.ordemId
        },
    });

    return Response.json(evento);
}