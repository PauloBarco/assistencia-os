export const runtime = "nodejs";

import type { Prisma, Status } from "@prisma/client";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { STATUS_META } from "@/lib/status-meta";

type SearchParams = Promise<{
  page?: string;
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
}>;

function buildPageHref(page: number, query: string, status: string, from?: string, to?: string, sort?: string) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (query) {
    params.set("q", query);
  }

  if (status) {
    params.set("status", status);
  }

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  if (sort) {
    params.set("sort", sort);
  }

  const search = params.toString();
  return search ? `/os?${search}` : "/os";
}

function isStatus(value: string): value is Status {
  return value in STATUS_META;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { page, q, status, from, to, sort } = await searchParams;
  const parsedPage = Number.parseInt(page || "1", 10);
  const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const query = q?.trim() ?? "";
  const selectedStatus = status && isStatus(status) ? status : "";
  const dateFrom = from || "";
  const dateTo = to || "";
  const sortBy = sort || "createdAt_desc";
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  // Mapear ordenação
  const orderByMap: Record<string, { createdAt?: "asc" | "desc"; numeroExterno?: "asc" | "desc"; updatedAt?: "asc" | "desc" }> = {
    "createdAt_desc": { createdAt: "desc" },
    "createdAt_asc": { createdAt: "asc" },
    "numeroExterno_desc": { numeroExterno: "desc" },
    "numeroExterno_asc": { numeroExterno: "asc" },
    "updatedAt_desc": { updatedAt: "desc" },
    "updatedAt_asc": { updatedAt: "asc" },
  };
  const orderBy = orderByMap[sortBy] || { createdAt: "desc" };

  // Construir filtro de data
  const dateFilter: Prisma.DateTimeFilter | undefined = (dateFrom || dateTo)
    ? {
        gte: dateFrom ? new Date(dateFrom + "T00:00:00Z") : undefined,
        lte: dateTo ? new Date(dateTo + "T23:59:59Z") : undefined,
      }
    : undefined;

  const where: Prisma.OrdemServicoWhereInput = {
    ...(selectedStatus ? { statusAtual: selectedStatus } : {}),
    ...(query
      ? {
          OR: [
            { numeroExterno: { contains: query, mode: "insensitive" } },
            { origem: { contains: query, mode: "insensitive" } },
            { descricao: { contains: query, mode: "insensitive" } },
            {
              equipamento: {
                is: {
                  OR: [
                    { marca: { contains: query, mode: "insensitive" } },
                    { modelo: { contains: query, mode: "insensitive" } },
                    { tipo: { contains: query, mode: "insensitive" } },
                    { defeito: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  };

  const [ordens, total] = await Promise.all([
    prisma.ordemServico.findMany({
      where,
      include: { equipamento: true },
      orderBy,
      take: limit,
      skip,
    }),
    prisma.ordemServico.count({ where }),
  ]);

  const hasNext = skip + limit < total;
  const hasPrev = currentPage > 1;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_46%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Ordens de servico</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Fila completa da operacao
              </h1>
              <p className="text-sm text-slate-600">
                {total} resultado{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
                {query ? ` para "${query}"` : ""}
                {selectedStatus ? ` em ${STATUS_META[selectedStatus].label.toLowerCase()}` : ""}
                {dateFrom || dateTo ? ` entre ${dateFrom || "..."} e ${dateTo || "..."}` : ""}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Voltar ao painel
              </Link>
              <Link
                href="/os/nova"
                className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Nova ordem
              </Link>
            </div>
          </div>

          <form className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.5fr_0.8fr_0.6fr_0.6fr_0.5fr]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Buscar por OS, origem ou equipamento</span>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Ex.: 2026-00124, notebook, Dell, parceiro..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">De</span>
              <input
                type="date"
                name="from"
                defaultValue={dateFrom}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Ate</span>
              <input
                type="date"
                name="to"
                defaultValue={dateTo}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Ordenar</span>
              <select
                name="sort"
                defaultValue={sortBy}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="createdAt_desc">Mais recentes</option>
                <option value="createdAt_asc">Mais antigos</option>
                <option value="numeroExterno_desc">OS (Z-A)</option>
                <option value="numeroExterno_asc">OS (A-Z)</option>
                <option value="updatedAt_desc">Atualizado (rec)</option>
                <option value="updatedAt_asc">Atualizado (ant)</option>
              </select>
            </label>

            <div className="flex items-end gap-3 lg:col-span-5">
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Filtrar
              </button>
              {(query || selectedStatus || dateFrom || dateTo || sortBy !== "createdAt_desc") && (
                <Link
                  href="/os"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Limpar
                </Link>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {ordens.length > 0 ? (
            ordens.map((os) => (
              <Link
                key={os.id}
                href={`/os/${os.id}`}
                className="block rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-950">OS {os.numeroExterno}</p>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_META[os.statusAtual].tone}`}>
                        {STATUS_META[os.statusAtual].label}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      {os.equipamento?.marca} {os.equipamento?.modelo}
                      {os.equipamento?.tipo ? ` • ${os.equipamento.tipo}` : ""}
                    </p>

                    <p className="text-sm text-slate-500">
                      Origem: {os.origem}
                    </p>

                    {os.equipamento?.defeito && (
                      <p className="max-w-3xl text-sm leading-6 text-slate-600">
                        {os.equipamento.defeito}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-sm text-slate-500">
                    Criada em {formatDateTime(os.createdAt)}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Nenhuma ordem encontrada</h2>
              <p className="mt-2 text-sm text-slate-600">
                Ajuste os filtros ou cadastre uma nova ordem para começar a acompanhar o fluxo.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/os"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Limpar filtros
                </Link>
                <Link
                  href="/os/nova"
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Nova ordem
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Pagina {currentPage}
          </div>

          <div className="flex gap-3">
            {hasPrev ? (
              <Link
                href={buildPageHref(currentPage - 1, query, selectedStatus)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Anterior
              </Link>
            ) : (
              <span className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300">
                Anterior
              </span>
            )}

            {hasNext ? (
              <Link
                href={buildPageHref(currentPage + 1, query, selectedStatus)}
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Proxima
              </Link>
            ) : (
              <span className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300">
                Proxima
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
