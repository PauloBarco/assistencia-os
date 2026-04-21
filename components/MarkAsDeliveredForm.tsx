"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAsDeliveredForm({ ordemId }: { ordemId: string }) {
  const router = useRouter();
  const [observacao, setObservacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/os/${ordemId}/entrega`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacao }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel registrar a entrega");
      }

      setObservacao("");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao registrar entrega");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-emerald-950">Fechar entrega</h3>
        <p className="mt-2 text-sm text-emerald-900">
          Marque a OS como entregue para encerrar o fluxo e registrar o momento no historico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-emerald-950">Observacao da entrega</span>
          <textarea
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            placeholder="Opcional: nome de quem retirou, data combinada, observacao final..."
            className="min-h-24 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Registrando..." : "Marcar como entregue"}
        </button>
      </form>
    </div>
  );
}
