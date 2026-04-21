"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddServicoForm({ ordemId }: { ordemId: string }) {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!descricao.trim()) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/os/${ordemId}/servicos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordemId,
          descricao: descricao.trim(),
          tecnico: tecnico.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel registrar o servico");
      }

      setDescricao("");
      setTecnico("");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao registrar servico");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-950">Servico realizado</h3>
        <p className="mt-2 text-sm text-slate-600">
          Registre intervencoes tecnicas executadas para manter rastreabilidade do reparo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Descricao do servico</span>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Ex.: troca de conector, limpeza interna, reparo de trilha..."
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Tecnico responsavel</span>
          <input
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Opcional"
          />
        </label>

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={isSaving || !descricao.trim()} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? "Salvando..." : "Registrar servico"}
        </button>
      </form>
    </div>
  );
}
