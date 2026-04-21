"use client";

import { TipoEvento } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EVENT_OPTIONS: Array<{
  value: TipoEvento;
  label: string;
  hint: string;
}> = [
  { value: "ATUALIZACAO", label: "Atualizacao interna", hint: "Anotacao livre sem alterar status." },
  { value: "DIAGNOSTICO", label: "Diagnostico", hint: "Move a OS para em analise." },
  { value: "MANUTENCAO_INTERNA", label: "Manutencao interna", hint: "Move a OS para em manutencao." },
  { value: "ENVIO_TERCEIRO", label: "Envio para terceiro", hint: "Marca a OS como enviada para parceiro." },
  { value: "RETORNO_TERCEIRO", label: "Retorno de terceiro", hint: "Registra retorno sem mudar status automaticamente." },
  { value: "AGUARDANDO_PECA", label: "Aguardando peca", hint: "Sinaliza dependencia de pecas." },
  { value: "FINALIZADO", label: "Finalizado", hint: "Marca a OS como pronta para entrega." },
];

export function AddEvento({ ordemId }: { ordemId: string }) {
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("ATUALIZACAO");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const selectedOption = EVENT_OPTIONS.find((option) => option.value === tipo);

  async function handleAdd() {
    if (!descricao.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordemId,
          tipo,
          descricao: descricao.trim(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Erro ao adicionar evento");
      }

      setDescricao("");
      setTipo("ATUALIZACAO");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao adicionar evento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-slate-950">
          Registrar evento
        </h3>
        <p className="text-sm text-slate-600">
          Escolha o tipo de movimentacao e descreva o que aconteceu com o equipamento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Tipo do evento</span>
          <select
            value={tipo}
            onChange={(event) => setTipo(event.target.value as TipoEvento)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            {EVENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{selectedOption?.hint}</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Descricao</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Descreva o procedimento, conclusao tecnica, peca pendente ou proximo passo."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={handleAdd}
          disabled={loading || !descricao.trim()}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar evento"}
        </button>

        {EVENT_OPTIONS.filter((option) => option.value !== tipo).slice(0, 3).map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={loading}
            onClick={() => setTipo(option.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
