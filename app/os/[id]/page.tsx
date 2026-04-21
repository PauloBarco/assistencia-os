import { prisma } from "@/lib/prisma";
import { AddEvento } from "@/components/AddEvento";
import Link from "next/link";

const STATUS_META = {
  RECEBIDO: { label: "Recebido", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  EM_ANALISE: { label: "Em analise", tone: "bg-amber-100 text-amber-800 border-amber-200" },
  EM_MANUTENCAO: { label: "Em manutencao", tone: "bg-sky-100 text-sky-800 border-sky-200" },
  EM_TERCEIRO: { label: "Em terceiro", tone: "bg-violet-100 text-violet-800 border-violet-200" },
  AGUARDANDO_PECA: { label: "Aguardando peca", tone: "bg-orange-100 text-orange-800 border-orange-200" },
  PRONTO: { label: "Pronto", tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  ENTREGUE: { label: "Entregue", tone: "bg-zinc-200 text-zinc-700 border-zinc-300" },
} as const;

const EVENT_META = {
  RECEBIMENTO: { label: "Recebimento", dot: "bg-slate-500" },
  DIAGNOSTICO: { label: "Diagnostico", dot: "bg-amber-500" },
  MANUTENCAO_INTERNA: { label: "Manutencao interna", dot: "bg-sky-500" },
  ENVIO_TERCEIRO: { label: "Envio terceiro", dot: "bg-violet-500" },
  RETORNO_TERCEIRO: { label: "Retorno terceiro", dot: "bg-fuchsia-500" },
  AGUARDANDO_PECA: { label: "Aguardando peca", dot: "bg-orange-500" },
  FINALIZADO: { label: "Finalizado", dot: "bg-emerald-500" },
  ATUALIZACAO: { label: "Atualizacao", dot: "bg-slate-400" },
} as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: {
      equipamento: true,
      eventos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!os) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">OS nao encontrada</h1>
          <p className="mt-2 text-slate-600">Verifique se a ordem ainda existe ou volte para a listagem principal.</p>
          <Link
            href="/os"
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Voltar para ordens
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_46%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/os" className="text-sm font-medium text-sky-700 hover:text-sky-900">
                  Voltar para ordens
                </Link>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_META[os.statusAtual].tone}`}>
                  {STATUS_META[os.statusAtual].label}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                  OS {os.numeroExterno}
                </h1>
                <p className="text-lg text-slate-600">
                  {os.equipamento?.marca} {os.equipamento?.modelo}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Tipo</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{os.equipamento?.tipo || "Nao informado"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Origem</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{os.origem}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Criada em</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(os.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Eventos</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{os.eventos.length} registrados</p>
                </div>
              </div>
            </div>

            <aside className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              <h2 className="text-xl font-semibold">Defeito relatado</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {os.equipamento?.defeito || "Nenhum defeito informado."}
              </p>

              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Observacoes iniciais
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {os.descricao || "Sem observacoes adicionais na abertura da ordem."}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <AddEvento ordemId={os.id} />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Historico</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Linha do tempo da OS</h2>
            </div>

            <div className="space-y-4">
              {os.eventos.length > 0 ? (
                os.eventos.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${EVENT_META[e.tipo].dot}`}></div>
                      <div className="mt-2 min-h-12 w-px bg-slate-200 last:hidden"></div>
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                          {EVENT_META[e.tipo].label}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDate(e.createdAt)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-slate-700">{e.descricao}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
                  Nenhum evento registrado ainda.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
