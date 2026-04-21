export const AUDIT_ACTION_META = {
  CREATE: {
    label: "Criacao",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  UPDATE: {
    label: "Edicao",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  DELETE: {
    label: "Exclusao",
    tone: "border-red-200 bg-red-50 text-red-700",
  },
  DELIVER: {
    label: "Entrega",
    tone: "border-violet-200 bg-violet-50 text-violet-700",
  },
  STATUS_UPDATE: {
    label: "Mudanca de status",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
} satisfies Record<string, { label: string; tone: string }>;

export function getAuditActionMeta(action: string) {
  return (
    AUDIT_ACTION_META[action as keyof typeof AUDIT_ACTION_META] ?? {
      label: action,
      tone: "border-slate-200 bg-slate-50 text-slate-700",
    }
  );
}
