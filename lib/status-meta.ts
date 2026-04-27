import type { Status } from "../generated/prisma/client";

export const STATUS_META: Record<
  Status,
  {
    label: string;
    tone: string;
    accent: string;
    border: string;
  }
> = {
  RECEBIDO: {
    label: "Recebido",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "text-slate-600",
    border: "border-slate-400",
  },
  EM_ANALISE: {
    label: "Em analise",
    tone: "bg-amber-100 text-amber-800 border-amber-200",
    accent: "text-yellow-600",
    border: "border-yellow-500",
  },
  EM_MANUTENCAO: {
    label: "Em manutencao",
    tone: "bg-sky-100 text-sky-800 border-sky-200",
    accent: "text-blue-600",
    border: "border-blue-500",
  },
  EM_TERCEIRO: {
    label: "Em terceiro",
    tone: "bg-violet-100 text-violet-800 border-violet-200",
    accent: "text-violet-600",
    border: "border-violet-500",
  },
  AGUARDANDO_PECA: {
    label: "Aguardando peca",
    tone: "bg-orange-100 text-orange-800 border-orange-200",
    accent: "text-orange-600",
    border: "border-orange-500",
  },
  PRONTO: {
    label: "Pronto",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accent: "text-green-600",
    border: "border-green-500",
  },
  ENTREGUE: {
    label: "Entregue",
    tone: "bg-zinc-200 text-zinc-700 border-zinc-300",
    accent: "text-emerald-700",
    border: "border-emerald-600",
  },
};

export const STATUS_COLUMNS = Object.entries(STATUS_META).map(([status, meta]) => ({
  status: status as Status,
  ...meta,
}));
