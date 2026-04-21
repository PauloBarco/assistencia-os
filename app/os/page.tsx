export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const parsedPage = Number.parseInt(page || "1", 10);
  const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const ordens = await prisma.ordemServico.findMany({
    include: { equipamento: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
  });

  const total = await prisma.ordemServico.count();
  const hasNext = skip + limit < total;
  const hasPrev = currentPage > 1;

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">
          Ordens de Serviço
        </h1>

        <Link
          href="/os/nova"
          className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Nova ordem
        </Link>
      </div>

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

      <div className="mt-6 flex justify-between">
        {hasPrev && (
          <Link href={`/os?page=${currentPage - 1}`} className="bg-blue-600 text-white px-4 py-2 rounded">
            Anterior
          </Link>
        )}
        <span>Página {currentPage}</span>
        {hasNext && (
          <Link href={`/os?page=${currentPage + 1}`} className="bg-blue-600 text-white px-4 py-2 rounded">
            Próxima
          </Link>
        )}
      </div>
    </div>
  );
}
