"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

type FormState = {
  numero: string;
  origem: string;
  descricao: string;
  tipo: string;
  marca: string;
  modelo: string;
  defeito: string;
};

const INITIAL_STATE: FormState = {
  numero: "",
  origem: "",
  descricao: "",
  tipo: "",
  marca: "",
  modelo: "",
  defeito: "",
};

type FieldProps = {
  id: keyof FormState;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function TextField({ id, label, placeholder, value, onChange }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

export function CreateOsForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json().catch(() => null)) as { id?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel criar a ordem de servico");
      }

      setForm(INITIAL_STATE);
      startTransition(() => {
        router.push(data?.id ? `/os/${data.id}` : "/os");
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao criar ordem de servico"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="numero"
          label="Numero da OS"
          placeholder="Ex.: 2026-00124"
          value={form.numero}
          onChange={(value) => updateField("numero", value)}
        />
        <TextField
          id="origem"
          label="Origem"
          placeholder="Balcao, parceiro, coleta..."
          value={form.origem}
          onChange={(value) => updateField("origem", value)}
        />
        <TextField
          id="tipo"
          label="Tipo do equipamento"
          placeholder="Notebook, celular, impressora..."
          value={form.tipo}
          onChange={(value) => updateField("tipo", value)}
        />
        <TextField
          id="marca"
          label="Marca"
          placeholder="Dell, Samsung, Epson..."
          value={form.marca}
          onChange={(value) => updateField("marca", value)}
        />
        <TextField
          id="modelo"
          label="Modelo"
          placeholder="Inspiron 15, A14, L3250..."
          value={form.modelo}
          onChange={(value) => updateField("modelo", value)}
        />
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Defeito relatado</span>
        <textarea
          value={form.defeito}
          onChange={(event) => updateField("defeito", event.target.value)}
          placeholder="Descreva o problema informado pelo cliente"
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Observacoes iniciais</span>
        <textarea
          value={form.descricao}
          onChange={(event) => updateField("descricao", event.target.value)}
          placeholder="Acessorios enviados, estado do equipamento, observacoes gerais"
          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </label>

      {errorMessage && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Salvando ordem..." : "Criar ordem de servico"}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => setForm(INITIAL_STATE)}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Limpar formulario
        </button>
      </div>
    </form>
  );
}
