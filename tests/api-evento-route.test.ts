import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("POST /api/evento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/evento/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordemId: "os-1", descricao: "" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Campos obrigatorios invalidos: ordemId, tipo e descricao",
    });
  });

  it("creates the event and updates status when the event type implies a new status", async () => {
    const tx = {
      evento: {
        create: vi.fn().mockResolvedValue({
          id: "ev-1",
          ordemId: "os-1",
          tipo: "FINALIZADO",
          descricao: "Equipamento finalizado",
        }),
      },
      ordemServico: {
        update: vi.fn().mockResolvedValue({ id: "os-1", statusAtual: "PRONTO" }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (mockTx: typeof tx) => unknown) => callback(tx));

    const { POST } = await import("@/app/api/evento/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordemId: "os-1",
          tipo: "FINALIZADO",
          descricao: "Equipamento finalizado",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(tx.evento.create).toHaveBeenCalledWith({
      data: {
        ordemId: "os-1",
        tipo: "FINALIZADO",
        descricao: "Equipamento finalizado",
      },
    });
    expect(tx.ordemServico.update).toHaveBeenCalledWith({
      where: { id: "os-1" },
      data: { statusAtual: "PRONTO" },
    });
    await expect(response.json()).resolves.toMatchObject({
      id: "ev-1",
      tipo: "FINALIZADO",
    });
  });
});
