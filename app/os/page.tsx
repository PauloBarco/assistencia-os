export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
          <Link key={os.id} href={`/os/${os.id}`}>
            <div className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition">
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
          </Link>
        ))}
      </div>
    </div>
  );
}