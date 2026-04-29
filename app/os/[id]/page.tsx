import { prisma } from "@/lib/prisma";
import { AddEvento } from "@/components/AddEvento";
import { DeleteOsButton } from "@/components/DeleteOsButton";
import { DeleteServicoButton } from "@/components/DeleteServicoButton";
import { EditOsForm } from "@/components/EditOsForm";
import { EventActions } from "@/components/EventActions";
import { MarkAsDeliveredForm } from "@/components/MarkAsDeliveredForm";
import { AddServicoForm } from "@/components/AddServicoForm";
import { ServiceActions } from "@/components/ServiceActions";
import { getAuditActionMeta } from "@/lib/audit-meta";
import { EVENT_META } from "@/lib/event-meta";
import { formatDateTime } from "@/lib/format";
import { STATUS_META } from "@/lib/status-meta";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: {
      equipamento: true,
      eventos: {
        orderBy: { createdAt: "desc" },
      },
      servicos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: { ordemId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
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
                {os.numeroTerceiro && (
                  <p className="text-lg text-slate-600">
                    Nº Terceiro: <span className="font-medium text-sky-700">{os.numeroTerceiro}</span>
                  </p>
                )}
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
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(os.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Registros</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{os.eventos.length + os.servicos.length} itens</p>
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
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Resumo para entrega</h3>
                  <p className="mt-2 text-sm text-slate-600">Abra uma versao limpa da OS para imprimir ou salvar em PDF.</p>
                </div>
                <Link
                  href={`/os/${os.id}/imprimir`}
                  target="_blank"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Abrir impressao
                </Link>
              </div>
            </div>
            <EditOsForm
              ordemId={os.id}
              initialValues={{
                numero: os.numeroExterno,
                origem: os.origem,
                descricao: os.descricao,
                tipo: os.equipamento?.tipo,
                marca: os.equipamento?.marca,
                modelo: os.equipamento?.modelo,
                serial: os.equipamento?.serial,
                defeito: os.equipamento?.defeito,
              }}
            />
            {os.statusAtual !== "ENTREGUE" && (
              <MarkAsDeliveredForm ordemId={os.id} />
            )}
            <AddServicoForm ordemId={os.id} />
            <AddEvento ordemId={os.id} />
            <DeleteOsButton ordemId={os.id} numeroExterno={os.numeroExterno} />
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-5">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Servicos</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Intervencoes realizadas</h2>
              </div>

              <div className="space-y-4">
                {os.servicos.length > 0 ? (
                  os.servicos.map((servico) => (
                    <div key={servico.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            {servico.tecnico ? `Tecnico: ${servico.tecnico}` : "Tecnico nao informado"}
                          </span>
                          <span className="text-xs text-slate-400">{formatDateTime(servico.createdAt)}</span>
                        </div>
                        <DeleteServicoButton ordemId={os.id} servicoId={servico.id} />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{servico.descricao}</p>
                      <ServiceActions
                        ordemId={os.id}
                        servicoId={servico.id}
                        initialDescription={servico.descricao}
                        initialTecnico={servico.tecnico}
                      />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
                    Nenhum servico registrado ainda.
                  </div>
                )}
              </div>
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
                            {formatDateTime(e.createdAt)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-slate-700">{e.descricao}</p>
                        <EventActions eventId={e.id} initialDescription={e.descricao} />
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

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-5">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Auditoria</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Acoes recentes</h2>
              </div>
              <div className="space-y-3">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => {
                    const actionMeta = getAuditActionMeta(log.action);

                    return (
                      <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${actionMeta.tone}`}>
                              {actionMeta.label}
                            </span>
                            <span className="text-xs uppercase tracking-wide text-slate-400">{log.entityType.replaceAll("_", " ")}</span>
                          </div>
                          <span className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{log.details}</p>
                        <p className="mt-1 text-xs text-slate-500">Responsavel: {log.actor || "Sistema"}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-slate-500">
                    Nenhuma acao auditada ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
