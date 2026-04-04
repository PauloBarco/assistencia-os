import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const body = await req.json();

    // Mapeamento de status
    let novoStatus = undefined

    if (body.tipo === "DIAGNOSTICO") {
        novoStatus = "EM_ANALISE";
    }

    if (body.tipo === "MANUTENÇAO") {
        novoStatus = "EM_MANUTENÇÃO";
    }

    if (body.tipo === "FINALIZADO"){
        novoStatus = "FINALIZADO";
    }

    const evento = await prisma.evento.create({
        data: {
            tipo: body.tipo,
            descricao: body.descricao,
            ordemId: body.ordemId
        },
    });

    // Atualiza o status da ordem de serviço
    if (novoStatus) {
        await prisma.ordemServico.update({
            where: { id: body.ordemId },
            data: { status: novoStatus }
        });
    }


    return Response.json(evento);
}