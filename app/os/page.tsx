import { prisma } from "@/lib/prisma";

export default async function Page() {
  const ordens = await prisma.ordemServico.findMany({
    include: { equipamento: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Ordens de Serviço
      </h1>

      <div className="space-y-3">
        {ordens.map((os) => (
          <div
            key={os.id}
            className="bg-white p-4 rounded shadow"
          >
            <p className="font-semibold">
              OS: {os.numeroExterno}
            </p>

            <p className="text-sm text-gray-600">
              {os.equipamento?.marca} {os.equipamento?.modelo}
            </p>

            <p className="text-sm">
              Status: {os.statusAtual}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}