"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteOsButton({
  ordemId,
  numeroExterno,
}: {
  ordemId: string;
  numeroExterno: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir a OS ${numeroExterno}? Essa acao remove historico, equipamento e servicos vinculados.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/os/${ordemId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel excluir a ordem");
      }

      router.push("/os");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao excluir a ordem");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
      <h3 className="text-lg font-semibold text-red-900">Zona de risco</h3>
      <p className="mt-2 text-sm leading-6 text-red-800">
        Exclua esta ordem apenas quando tiver certeza. A remocao apaga tambem o historico e os dados relacionados.
      </p>

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Excluindo..." : "Excluir ordem de servico"}
      </button>
    </div>
  );
}
