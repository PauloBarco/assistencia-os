"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Equipamento, Evento, OrdemServico, Status } from "@prisma/client";

import { STATUS_COLUMNS, STATUS_META } from "@/lib/status-meta";
import { LoadingCard } from "@/components/Loading";

type OrdemComIncludes = OrdemServico & {
  equipamento: Equipamento | null;
  eventos: Evento[];
};

const ACTIVE_STATUS_COLUMNS = STATUS_COLUMNS.filter(({ status }) => status !== "ENTREGUE");
const ORIGEM_FILTERS = ["Todas", "Balcao", "Parceiro", "Coleta", "Entrega"] as const;

function matchesSearch(ordem: OrdemComIncludes, search: string) {
  if (!search) {
    return true;
  }

  const normalized = search.toLowerCase();
  const fields = [
    ordem.numeroExterno,
    ordem.origem,
    ordem.equipamento?.marca,
    ordem.equipamento?.modelo,
    ordem.equipamento?.tipo,
    ordem.equipamento?.defeito,
  ];

  return fields.some((field) => field?.toLowerCase().includes(normalized));
}

export default function Page() {
  const [ordens, setOrdens] = useState<OrdemComIncludes[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<(typeof ORIGEM_FILTERS)[number]>("Todas");
  const [selectedStatus, setSelectedStatus] = useState<Status | "TODOS">("TODOS");
  const [showDelivered, setShowDelivered] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const deferredSearch = useDeferredValue(search);

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

  const filteredOrdens = ordens.filter((ordem) => {
    const matchesOrigin =
      selectedOrigin === "Todas" ||
      ordem.origem.toLowerCase().includes(selectedOrigin.toLowerCase());
    const matchesStatus =
      selectedStatus === "TODOS" || ordem.statusAtual === selectedStatus;

    return matchesOrigin && matchesStatus && matchesSearch(ordem, deferredSearch);
  });

  const grupos = Object.fromEntries(
    STATUS_COLUMNS.map(({ status }) => [
      status,
      filteredOrdens.filter((ordem) => ordem.statusAtual === status),
    ])
  ) as Record<string, OrdemComIncludes[]>;

  const deliveredOrdens = grupos.ENTREGUE;
  const activeOrdensCount = filteredOrdens.length - deliveredOrdens.length;
  const prontoCount = grupos.PRONTO.length;
  const aguardandoCount = grupos.AGUARDANDO_PECA.length;
  const emTerceiroCount = grupos.EM_TERCEIRO.length;

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_46%,#ffffff_100%)] px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-4 sm:p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Kanban operacional</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Fluxo visual das ordens
              </h1>
              <p className="text-sm text-slate-600">
                {activeOrdensCount} ordem{activeOrdensCount === 1 ? "" : "ens"} em fluxo ativo
                {deliveredOrdens.length > 0 ? ` e ${deliveredOrdens.length} entregue${deliveredOrdens.length === 1 ? "" : "s"}` : ""}.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/os"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:py-3"
              >
                Ver lista
              </Link>
              <Link
                href="/os/nova"
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Nova ordem
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Buscar ordem ou equipamento</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="OS, marca, modelo, defeito, origem..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Filtro de origem</span>
              <select
                value={selectedOrigin}
                onChange={(event) => setSelectedOrigin(event.target.value as (typeof ORIGEM_FILTERS)[number])}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                {ORIGEM_FILTERS.map((origin) => (
                  <option key={origin} value={origin}>
                    {origin}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => setShowDelivered((current) => !current)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {showDelivered ? "Ocultar entregues" : "Mostrar entregues"}
              </button>
              <button
                type="button"
                onClick={() => setCompactMode((current) => !current)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {compactMode ? "Modo expandido" : "Modo compacto"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-4 text-white">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">Ativas</p>
              <p className="mt-2 text-3xl font-semibold">{activeOrdensCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">Prontas</p>
              <p className="mt-2 text-3xl font-semibold">{prontoCount}</p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-orange-900">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-700">Aguardando peca</p>
              <p className="mt-2 text-3xl font-semibold">{aguardandoCount}</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4 text-violet-900">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-700">Em terceiro</p>
              <p className="mt-2 text-3xl font-semibold">{emTerceiroCount}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
            <button
              type="button"
              onClick={() => setSelectedStatus("TODOS")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                selectedStatus === "TODOS"
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Todos
            </button>
            {ACTIVE_STATUS_COLUMNS.map(({ status, label, tone }) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                  selectedStatus === status
                    ? `${tone}`
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {errorMessage && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Fluxo ativo</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Da entrada ate a conclusao</h2>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max gap-4">
                {ACTIVE_STATUS_COLUMNS.map(({ status, label, accent, border }) => (
                  <Droppable key={status} droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`w-[290px] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] ${
                          compactMode ? "min-h-[420px]" : "min-h-[520px]"
                        }`}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h2 className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
                            {label}
                          </h2>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {grupos[status].length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {grupos[status].map((os, index) => (
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
                                  className={`rounded-[1.25rem] border-l-4 bg-slate-50 p-4 shadow-sm transition-all duration-200 ${border} ${
                                    snapshot.isDragging ? "rotate-1 scale-[1.02] shadow-lg" : "hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                                  }`}
                                >
                                  <Link href={`/os/${os.id}`} className="block space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-sm font-semibold text-slate-950">OS {os.numeroExterno}</p>
                                      <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_META[os.statusAtual].tone}`}>
                                        {STATUS_META[os.statusAtual].label}
                                      </span>
                                    </div>

                                    <p className="text-xs text-slate-600">
                                      {os.equipamento?.marca} {os.equipamento?.modelo}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Origem: {os.origem}
                                    </p>
                                    {!compactMode && os.equipamento?.defeito && (
                                      <p className="line-clamp-3 text-xs leading-5 text-slate-600">
                                        {os.equipamento.defeito}
                                      </p>
                                    )}
                                  </Link>
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {grupos[status].length === 0 && (
                            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">
                              Nenhuma OS nesta etapa.
                            </div>
                          )}

                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </section>

          {showDelivered && (
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Entregues</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Ordens encerradas</h2>
                </div>
                <span className="text-sm text-slate-500">{deliveredOrdens.length} registro{deliveredOrdens.length === 1 ? "" : "s"}</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {deliveredOrdens.length > 0 ? (
                  deliveredOrdens.map((os) => (
                    <Link
                      key={os.id}
                      href={`/os/${os.id}`}
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">OS {os.numeroExterno}</p>
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_META.ENTREGUE.tone}`}>
                          {STATUS_META.ENTREGUE.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        {os.equipamento?.marca} {os.equipamento?.modelo}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Origem: {os.origem}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                    Nenhuma OS entregue dentro do filtro atual.
                  </div>
                )}
              </div>
            </section>
          )}
        </DragDropContext>
      </div>
    </main>
  );
}
