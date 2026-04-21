"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { OrdemServico, Status, Equipamento, Evento } from "@prisma/client";

type OrdemComIncludes = OrdemServico & {
  equipamento: Equipamento | null;
  eventos: Evento[];
};

const STATUS_COLUMNS: Array<{
  status: Status;
  label: string;
  accent: string;
  border: string;
}> = [
  { status: "RECEBIDO", label: "Recebido", accent: "text-gray-600", border: "border-gray-400" },
  { status: "EM_ANALISE", label: "Em analise", accent: "text-yellow-600", border: "border-yellow-500" },
  { status: "EM_MANUTENCAO", label: "Em manutencao", accent: "text-blue-600", border: "border-blue-500" },
  { status: "EM_TERCEIRO", label: "Em terceiro", accent: "text-violet-600", border: "border-violet-500" },
  { status: "AGUARDANDO_PECA", label: "Aguardando peca", accent: "text-orange-600", border: "border-orange-500" },
  { status: "PRONTO", label: "Pronto", accent: "text-green-600", border: "border-green-500" },
  { status: "ENTREGUE", label: "Entregue", accent: "text-emerald-700", border: "border-emerald-600" },
];

export default function Page() {
  const [ordens, setOrdens] = useState<OrdemComIncludes[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrdens() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/os");
        const data = (await response.json().catch(() => null)) as OrdemComIncludes[] | { error?: string } | null;

        if (!response.ok) {
          throw new Error(
            data && !Array.isArray(data) && data.error
              ? data.error
              : "Nao foi possivel carregar as ordens"
          );
        }

        if (isMounted && Array.isArray(data)) {
          setOrdens(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar as ordens");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadOrdens();

    return () => {
      isMounted = false;
    };
  }, []);

  const grupos = Object.fromEntries(
    STATUS_COLUMNS.map(({ status }) => [
      status,
      ordens.filter((ordem) => ordem.statusAtual === status),
    ])
  ) as Record<Status, OrdemComIncludes[]>;

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const nextStatus = destination.droppableId as Status;
    const previousOrdens = ordens;

    setErrorMessage(null);
    setOrdens((prev) =>
      prev.map((o) =>
        o.id === draggableId
          ? { ...o, statusAtual: nextStatus }
          : o
      )
    );

    const response = await fetch("/api/os/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draggableId,
        status: nextStatus,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setOrdens(previousOrdens);
      setErrorMessage(data?.error || "Nao foi possivel atualizar o status");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Kanban de Ordens
      </h1>

      {errorMessage && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {loading && (
        <p className="mb-4 text-sm text-gray-500">
          Carregando ordens...
        </p>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {STATUS_COLUMNS.map(({ status, label, accent, border }) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded-xl min-h-[500px] shadow-inner"
                >
                  {/* TÍTULO COM COR + CONTADOR */}
                  <h2
                    className={`font-semibold mb-4 text-sm uppercase tracking-wide ${accent}`}
                  >
                    {label} ({grupos[status].length})
                  </h2>

                  <div className="space-y-3">
                    {grupos[status].map((os: OrdemComIncludes, index: number) => (
                      <Draggable
                        key={os.id}
                        draggableId={os.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-xl shadow transition-all duration-200 cursor-pointer
                            
                            hover:shadow-md hover:-translate-y-1

                            ${snapshot.isDragging && "rotate-1 scale-105"}

                            border-l-4
                            ${border}
                          `}
                          >
                            <Link href={`/os/${os.id}`}>
                              <p className="font-semibold text-sm">
                                OS {os.numeroExterno}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {os.equipamento?.marca}{" "}
                                {os.equipamento?.modelo}
                              </p>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
