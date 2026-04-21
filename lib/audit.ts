import { prisma } from "@/lib/prisma";

type AuditPayload = {
  ordemId?: string;
  entityType: string;
  entityId: string;
  action: string;
  actor?: string;
  details: string;
};

type AuditClient = {
  auditLog: {
    create: (args: { data: AuditPayload }) => Promise<unknown>;
  };
};

export async function recordAuditLog(payload: AuditPayload, client: AuditClient = prisma) {
  try {
    await client.auditLog.create({
      data: payload,
    });
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
}
