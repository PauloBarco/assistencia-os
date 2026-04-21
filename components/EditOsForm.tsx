"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EditOsFormProps = {
  ordemId: string;
  initialValues: {
    numero: string;
    origem: string;
    descricao?: string | null;
    tipo?: string | null;
    marca?: string | null;
    modelo?: string | null;
    serial?: string | null;
    defeito?: string | null;
  };
};

type FormState = {
  numero: string;
  origem: string;
  descricao: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  defeito: string;
};

export function EditOsForm({ ordemId, initialValues }: EditOsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    numero: initialValues.numero,
    origem: initialValues.origem,
    descricao: initialValues.descricao ?? "",
    tipo: initialValues.tipo ?? "",
    marca: initialValues.marca ?? "",
    modelo: initialValues.modelo ?? "",
    serial: initialValues.serial ?? "",
    defeito: initialValues.defeito ?? "",
  });

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/os/${ordemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel atualizar a ordem");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao atualizar a ordem");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-slate-950">Editar dados da OS</h3>
        <p className="mt-2 text-sm text-slate-600">
          Atualize numero, origem e dados do equipamento sem sair da ordem.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Numero da OS</span>
            <input value={form.numero} onChange={(e) => updateField("numero", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Origem</span>
            <input value={form.origem} onChange={(e) => updateField("origem", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tipo</span>
            <input value={form.tipo} onChange={(e) => updateField("tipo", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Marca</span>
            <input value={form.marca} onChange={(e) => updateField("marca", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Modelo</span>
            <input value={form.modelo} onChange={(e) => updateField("modelo", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Serial</span>
            <input value={form.serial} onChange={(e) => updateField("serial", e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Defeito relatado</span>
          <textarea value={form.defeito} onChange={(e) => updateField("defeito", e.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Observacoes iniciais</span>
          <textarea value={form.descricao} onChange={(e) => updateField("descricao", e.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
        </label>

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={isSaving} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? "Salvando..." : "Salvar alteracoes"}
        </button>
      </form>
    </div>
  );
}
