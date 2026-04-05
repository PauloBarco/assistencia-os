"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function Page() {
  const [ordens, setOrdens] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/os")
      .then((res) => res.json())
      .then(setOrdens);
  }, []);

  const grupos = {
    RECEBIDO: ordens.filter((o) => String(o.statusAtual) === "RECEBIDO"),
    EM_ANALISE: ordens.filter((o) => String(o.statusAtual) === "EM_ANALISE"),
    EM_MANUTENCAO: ordens.filter((o) => String(o.statusAtual) === "EM_MANUTENCAO"),
    FINALIZADO: ordens.filter((o) => String(o.statusAtual) === "FINALIZADO"),
  };

  async function onDragEnd(result: any) {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    await fetch("/api/os/update-status", {
      method: "POST",
      body: JSON.stringify({
        id: draggableId,
        status: destination.droppableId,
      }),
    });

    // Atualiza UI sem reload
    setOrdens((prev) =>
      prev.map((o) =>
        o.id === draggableId
          ? { ...o, statusAtual: destination.droppableId }
          : o
      )
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Kanban de Ordens
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(grupos).map(([status, lista]) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded-xl min-h-[500px] shadow-inner"
                >
                  {/* TÍTULO COM COR + CONTADOR */}
                  <h2
                    className={`font-semibold mb-4 text-sm uppercase tracking-wide
                    ${status === "RECEBIDO" && "text-gray-600"}
                    ${status === "EM_ANALISE" && "text-yellow-600"}
                    ${status === "EM_MANUTENCAO" && "text-blue-600"}
                    ${status === "FINALIZADO" && "text-green-600"}
                  `}
                  >
                    {status} ({lista.length})
                  </h2>

                  <div className="space-y-3">
                    {lista.map((os: any, index: number) => (
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
                            ${status === "RECEBIDO" && "border-gray-400"}
                            ${status === "EM_ANALISE" && "border-yellow-500"}
                            ${status === "EM_MANUTENCAO" && "border-blue-500"}
                            ${status === "FINALIZADO" && "border-green-500"}
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