import Link from "next/link";
import { notFound } from "next/navigation";

import { EVENT_META } from "@/lib/event-meta";
import { formatDateOnly, formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { STATUS_META } from "@/lib/status-meta";

export default async function ImprimirOsPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!os) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] print:rounded-none print:shadow-none">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resumo para entrega</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">OS {os.numeroExterno}</h1>
          </div>
          <div className="flex gap-3">
            <Link href={`/os/${os.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Voltar
            </Link>
            <button onClick={() => window.print()} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Imprimir
            </button>
          </div>
        </div>

        <section className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Assistencia tecnica</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">OS {os.numeroExterno}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Gerado em {formatDateTime(new Date())}
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_META[os.statusAtual].tone}`}>
              {STATUS_META[os.statusAtual].label}
            </span>
          </div>
        </section>

        <section className="grid gap-6 border-b border-slate-200 py-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Equipamento</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-950">Tipo:</span> {os.equipamento?.tipo || "Nao informado"}</p>
              <p><span className="font-semibold text-slate-950">Marca:</span> {os.equipamento?.marca || "Nao informada"}</p>
              <p><span className="font-semibold text-slate-950">Modelo:</span> {os.equipamento?.modelo || "Nao informado"}</p>
              <p><span className="font-semibold text-slate-950">Serial:</span> {os.equipamento?.serial || "Nao informado"}</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Atendimento</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-950">Origem:</span> {os.origem}</p>
              <p><span className="font-semibold text-slate-950">Abertura:</span> {formatDateOnly(os.createdAt)}</p>
              <p><span className="font-semibold text-slate-950">Status atual:</span> {STATUS_META[os.statusAtual].label}</p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Defeito e observacoes</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
            <p><span className="font-semibold text-slate-950">Defeito relatado:</span> {os.equipamento?.defeito || "Nao informado"}</p>
            <p><span className="font-semibold text-slate-950">Observacoes iniciais:</span> {os.descricao || "Sem observacoes adicionais."}</p>
          </div>
        </section>

        <section className="border-b border-slate-200 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Servicos realizados</h2>
          <div className="mt-4 space-y-4">
            {os.servicos.length > 0 ? (
              os.servicos.map((servico, index) => (
                <div key={servico.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Servico {index + 1}</span>
                    <span>{formatDateTime(servico.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{servico.descricao}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Tecnico: {servico.tecnico || "Nao informado"}
                  </p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-sm text-slate-500">Nenhum servico registrado.</p>
            )}
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Historico resumido</h2>
          <div className="mt-4 space-y-3">
            {os.eventos.length > 0 ? (
              os.eventos.map((evento) => (
                <div key={evento.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{EVENT_META[evento.tipo].label}</span>
                    <span className="text-xs text-slate-500">{formatDateTime(evento.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{evento.descricao}</p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-sm text-slate-500">Nenhum evento registrado.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
