"use client";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Status } from "@prisma/client";
import { ordens, setOrdens } from "@/store/ordens";

export default async function Page() {
    const [ordens, setOrdens] = useState([]);

  useEffect(() => {
    fetch("/api/os")
      .then((res) => res.json())
      .then(setOrdens);
  }, []);
  
export default async function Page() {
  const ordens = await prisma.ordemServico.findMany({
    include: { equipamento: true },
    orderBy: { createdAt: "desc" },
  });

const grupos = {
  RECEBIDO: ordens.filter((o) => String(o.statusAtual) === "RECEBIDO"),
  EM_ANALISE: ordens.filter((o) => String(o.statusAtual) === "EM_ANALISE"),
  EM_MANUTENCAO: ordens.filter((o) => String(o.statusAtual) === "EM_MANUTENCAO"),
  FINALIZADO: ordens.filter((o) => String(o.statusAtual) === "FINALIZADO"),
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Kanban de Ordens
      </h1>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(grupos).map(([status, lista]) => (
          <div key={status} className="bg-gray-100 p-3 rounded">
            <h2 className="font-semibold mb-3">
              {status}
            </h2>

            <div className="space-y-2">
              {lista.map((os) => (
                <Link key={os.id} href={`/os/${os.id}`}>
                  <div className="bg-white p-3 rounded shadow hover:bg-gray-50 cursor-pointer">
                    <p className="font-semibold">
                      OS {os.numeroExterno}
                    </p>

                    <p className="text-xs text-gray-500">
                      {os.equipamento?.marca}{" "}
                      {os.equipamento?.modelo}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}