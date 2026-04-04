import { prisma } from "@/lib/prisma";
import { AddEvento } from "@/components/AddEvento";

export default async function Page({ params }: any) {
  const { id } = await params; // 🔥 CORREÇÃO AQUI

  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: {
      equipamento: true,
      eventos: true,
    },
  });

  if (!os) {
    return <div>OS não encontrada</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        OS {os.numeroExterno}
      </h1>

      <p className="text-gray-600">
        {os.equipamento?.marca} {os.equipamento?.modelo}
      </p>

      <span className="inline-block px-3 py-1 rounded text-white text-sm bg-blue-600">
          {os.statusAtual}
      </span>
      
     <div className="mt-6">
  <h2 className="font-semibold mb-4">Histórico</h2>

  <div className="space-y-4">
    {os.eventos.map((e) => (
      <div
        key={e.id}
        className="flex items-start gap-3"
      >
        {/* bolinha */}
        <div className="w-3 h-3 mt-2 rounded-full bg-blue-600"></div>

        {/* conteúdo */}
        <div className="bg-white p-3 rounded shadow w-full">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">
              {e.tipo}
            </span>

            <span className="text-xs text-gray-400">
              {new Date(e.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="mt-1">{e.descricao}</p>
        </div>
      </div>
    ))}
  </div>
</div>

      <AddEvento ordemId={os.id} />
    </div>
  );
}