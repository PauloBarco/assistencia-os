import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { STATUS_META } from "@/lib/status-meta";

const QUICK_ACTIONS = [
  {
    title: "Cadastrar nova OS",
    description: "Abra uma ordem com dados do equipamento e defeito inicial.",
    href: "/os/nova",
    tone: "bg-sky-600 text-white",
  },
  {
    title: "Acompanhar ordens",
    description: "Veja a fila completa com paginação e detalhes de cada equipamento.",
    href: "/os",
    tone: "bg-slate-950 text-white",
  },
  {
    title: "Abrir kanban",
    description: "Movimente as ordens por etapa e enxergue gargalos rapidamente.",
    href: "/kanban",
    tone: "bg-white text-slate-900 border border-slate-200",
  },
] as const;

export default async function Home() {
  const [totalOrdens, ordensRecentes, statusGroups] = await Promise.all([
    prisma.ordemServico.count(),
    prisma.ordemServico.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        equipamento: true,
      },
    }),
    prisma.ordemServico.groupBy({
      by: ["statusAtual"],
      _count: {
        statusAtual: true,
      },
    }),
  ]);

  const countsByStatus = Object.fromEntries(
    statusGroups.map((group) => [group.statusAtual, group._count.statusAtual])
  ) as Partial<Record<keyof typeof STATUS_META, number>>;

  const emAndamento = totalOrdens - (countsByStatus.ENTREGUE ?? 0);
  const prontosParaEntrega = countsByStatus.PRONTO ?? 0;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.5fr_0.9fr] lg:px-10">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-800">
                Painel da assistencia
              </span>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  Tudo o que a bancada precisa para acompanhar ordens sem perder contexto.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Consulte o volume atual, veja o que esta pronto para entrega e entre direto na lista ou no kanban.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`rounded-2xl px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-lg ${action.tone}`}
                  >
                    <p className="text-base font-semibold">{action.title}</p>
                    <p className="mt-1 text-sm opacity-80">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <article className="rounded-3xl bg-slate-950 px-6 py-5 text-white shadow-lg">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Total</p>
                <p className="mt-3 text-4xl font-semibold">{totalOrdens}</p>
                <p className="mt-2 text-sm text-slate-300">ordens cadastradas no sistema</p>
              </article>

              <article className="rounded-3xl bg-amber-100 px-6 py-5 text-amber-900 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Em andamento</p>
                <p className="mt-3 text-4xl font-semibold">{emAndamento}</p>
                <p className="mt-2 text-sm text-amber-800">ordens ainda em fluxo tecnico</p>
              </article>

              <article className="rounded-3xl bg-emerald-100 px-6 py-5 text-emerald-900 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Prontas</p>
                <p className="mt-3 text-4xl font-semibold">{prontosParaEntrega}</p>
                <p className="mt-2 text-sm text-emerald-800">aguardando retirada ou entrega</p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Volume por etapa</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Mapa rapido da operacao</h2>
              </div>
              <Link href="/kanban" className="text-sm font-medium text-sky-700 hover:text-sky-900">
                Abrir kanban
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(STATUS_META).map(([status, meta]) => (
                <div
                  key={status}
                  className={`rounded-2xl border px-4 py-4 ${meta.tone}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium uppercase tracking-wide">{meta.label}</p>
                    <span className="text-2xl font-semibold">{countsByStatus[status as keyof typeof STATUS_META] ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Ultimas entradas</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ordens recentes</h2>
              </div>
              <Link href="/os" className="text-sm font-medium text-sky-700 hover:text-sky-900">
                Ver todas
              </Link>
            </div>

            <div className="space-y-3">
              {ordensRecentes.length > 0 ? (
                ordensRecentes.map((ordem) => (
                  <Link
                    key={ordem.id}
                    href={`/os/${ordem.id}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-950">OS {ordem.numeroExterno}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {ordem.equipamento?.marca} {ordem.equipamento?.modelo}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Origem: {ordem.origem}</p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_META[ordem.statusAtual].tone}`}>
                          {STATUS_META[ordem.statusAtual].label}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">{formatDateTime(ordem.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
                  Nenhuma ordem cadastrada ainda.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
