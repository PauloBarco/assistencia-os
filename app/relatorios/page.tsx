export const runtime = "nodejs";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { STATUS_META } from "@/lib/status-meta";

type SearchParams = Promise<{
  from?: string;
  to?: string;
  tipo?: string;
}>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { from, to, tipo } = await searchParams;
  const dateFrom = from || "";
  const dateTo = to || "";
  const reportType = tipo || "resumo";

  // Default to current month
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const defaultTo = now.toISOString().split("T")[0];

  const filterFrom = dateFrom || defaultFrom;
  const filterTo = dateTo || defaultTo;

  const dateFilter: Prisma.DateTimeFilter = {
    gte: new Date(filterFrom + "T00:00:00Z"),
    lte: new Date(filterTo + "T23:59:59Z"),
  };

  // Queries for different report types
  const [
    totalCreated,
    totalDelivered,
    byStatus,
    byOrigin,
    byEquipmentType,
    topDefects,
    avgTimeToDelivery,
    pendingOver5Days,
  ] = await Promise.all([
    // Total created in period
    prisma.ordemServico.count({
      where: { createdAt: dateFilter },
    }),
    // Total delivered in period
    prisma.ordemServico.count({
      where: {
        statusAtual: "ENTREGUE",
        updatedAt: dateFilter,
      },
    }),
    // By status
    prisma.ordemServico.groupBy({
      by: ["statusAtual"],
      _count: { statusAtual: true },
      where: { createdAt: dateFilter },
    }),
    // By origin
    prisma.ordemServico.groupBy({
      by: ["origem"],
      _count: { origem: true },
      where: { createdAt: dateFilter },
    }),
    // By equipment type
    prisma.ordemServico.groupBy({
      by: ["statusAtual"],
      _count: { statusAtual: true },
      where: {
        createdAt: dateFilter,
        equipamento: { isNot: null },
      },
    }),
    // Top defects
    prisma.equipamento.findMany({
      where: {
        ordem: {
          createdAt: dateFilter,
        },
      },
      select: {
        defeito: true,
      },
      take: 100,
    }),
    // Average time to delivery (simplified)
    prisma.ordemServico.aggregate({
      where: {
        statusAtual: "ENTREGUE",
        updatedAt: dateFilter,
      },
      _count: { id: true },
    }),
    // Pending over 5 days
    prisma.ordemServico.count({
      where: {
        statusAtual: { in: ["AGUARDANDO_PECA", "EM_TERCEIRO", "EM_MANUTENCAO", "EM_ANALISE"] },
        updatedAt: { lte: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    byStatus.map((g) => [g.statusAtual, g._count.statusAtual])
  ) as Partial<Record<string, number>>;

  const originCounts = Object.fromEntries(
    byOrigin.map((g) => [g.origem, g._count.origem])
  ) as Record<string, number>;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_46%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Relatorios</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Analise de desempenho
              </h1>
              <p className="text-sm text-slate-600">
                Periodo: {filterFrom} ate {filterTo}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/"
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Voltar ao painel
              </a>
            </div>
          </div>

          <form className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_auto]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">De</span>
                <input
                  type="date"
                  name="from"
                  defaultValue={filterFrom}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Ate</span>
                <input
                  type="date"
                  name="to"
                  defaultValue={filterTo}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Gerar relatorio
              </button>
            </div>
          </form>
        </section>

        {/* Summary Cards */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Criadas no periodo</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalCreated}</p>
            <p className="mt-2 text-sm text-slate-500">ordens de servico</p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Entregues no periodo</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalDelivered}</p>
            <p className="mt-2 text-sm text-slate-500">
              {totalCreated > 0 ? Math.round((totalDelivered / totalCreated) * 100) : 0}% do total
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Em aberto</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {totalCreated - totalDelivered}
            </p>
            <p className="mt-2 text-sm text-slate-500">ordens em andamento</p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Em atraso</p>
            <p className="mt-3 text-3xl font-semibold text-amber-600">{pendingOver5Days}</p>
            <p className="mt-2 text-sm text-slate-500">ha mais de 5 dias</p>
          </div>
        </section>

        {/* Status Distribution */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl font-semibold text-slate-950">Distribuicao por status</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(STATUS_META).map(([status, meta]) => {
                const count = statusCounts[status] || 0;
                const percentage = totalCreated > 0 ? Math.round((count / totalCreated) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${meta.border.split(" ")[0].replace("border-", "bg-")}`}></div>
                    <span className="w-32 text-sm text-slate-700">{meta.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${meta.tone.split(" ")[0]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-16 text-right text-sm font-medium text-slate-900">{count}</span>
                    <span className="w-12 text-right text-xs text-slate-500">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl font-semibold text-slate-950">Por origem</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(originCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([origin, count]) => {
                  const percentage = totalCreated > 0 ? Math.round((count / totalCreated) * 100) : 0;
                  return (
                    <div key={origin} className="flex items-center gap-3">
                      <span className="w-32 text-sm text-slate-700">{origin}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="w-16 text-right text-sm font-medium text-slate-900">{count}</span>
                      <span className="w-12 text-right text-xs text-slate-500">{percentage}%</span>
                    </div>
                  );
                })}
              {Object.keys(originCounts).length === 0 && (
                <p className="text-sm text-slate-500">Nenhuma ordem no periodo.</p>
              )}
            </div>
          </div>
        </section>

        {/* Top Defects */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-semibold text-slate-950">Defeitos mais comuns</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-sm font-medium text-slate-500">Defeito</th>
                  <th className="pb-3 text-right text-sm font-medium text-slate-500">Quantidade</th>
                  <th className="pb-3 text-right text-sm font-medium text-slate-500">% do total</th>
                </tr>
              </thead>
              <tbody>
                {topDefects.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 text-sm text-slate-700">{item.defeito || "Nao informado"}</td>
                    <td className="py-3 text-right text-sm font-medium text-slate-900">-</td>
                    <td className="py-3 text-right text-sm text-slate-500">-</td>
                  </tr>
                ))}
                {topDefects.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-sm text-slate-500">
                      Nenhum defeito registrado no periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}