import Link from "next/link";

import { CreateOsForm } from "@/components/CreateOsForm";

export default function NovaOsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_46%,#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 px-8 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-800">
                Cadastro rapido
              </span>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                  Nova ordem de servico
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  Registre a entrada do equipamento com as informacoes essenciais para a triagem e o acompanhamento tecnico.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Voltar ao painel
              </Link>
              <Link
                href="/os"
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ver ordens
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <CreateOsForm />
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-semibold">Checklist de entrada</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>Confirme numero da OS e origem antes de salvar para evitar duplicidade operacional.</p>
              <p>Use o campo de defeito para registrar exatamente o relato do cliente, sem resumir demais.</p>
              <p>Em observacoes iniciais, vale anotar acessorios, senha, avarias cosmeticas e condicoes de teste.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
