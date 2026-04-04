"use client";

import { useState } from "react";

export function AddEvento({ ordemId }: { ordemId: string }) {
  const [descricao, setDescricao] = useState("");

  async function handleAdd() {
    if (!descricao) return;

    await fetch("/api/evento", {
      method: "POST",
      body: JSON.stringify({
        ordemId,
        tipo: "ATUALIZACAO",
        descricao,
      }),
    });

    setDescricao("");
    location.reload();
  }

  return (
    <div className="mt-6 bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">
        Adicionar evento
      </h3>

      <textarea
        className="w-full border p-2 rounded"
        placeholder="O que foi feito na máquina..."
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <button
        onClick={handleAdd}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Salvar
      </button>
    </div>
  );
}