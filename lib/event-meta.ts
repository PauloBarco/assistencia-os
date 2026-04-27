import type { TipoEvento } from "../generated/prisma/client";

export const EVENT_META: Record<TipoEvento, { label: string; dot: string }> = {
  RECEBIMENTO: { label: "Recebimento", dot: "bg-slate-500" },
  DIAGNOSTICO: { label: "Diagnostico", dot: "bg-amber-500" },
  MANUTENCAO_INTERNA: { label: "Manutencao interna", dot: "bg-sky-500" },
  ENVIO_TERCEIRO: { label: "Envio terceiro", dot: "bg-violet-500" },
  RETORNO_TERCEIRO: { label: "Retorno terceiro", dot: "bg-fuchsia-500" },
  AGUARDANDO_PECA: { label: "Aguardando peca", dot: "bg-orange-500" },
  FINALIZADO: { label: "Finalizado", dot: "bg-emerald-500" },
  ATUALIZACAO: { label: "Atualizacao", dot: "bg-slate-400" },
};
