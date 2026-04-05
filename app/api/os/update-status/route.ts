import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  await prisma.ordemServico.update({
    where: { id: body.id },
    data: {
      statusAtual: body.status,
    },
  });

  return Response.json({ ok: true });
}