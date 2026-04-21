import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("POST /api/os/[id]/entrega", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 409 when the order is already delivered", async () => {
    const tx = {
      ordemServico: {
        findUnique: vi.fn().mockResolvedValue({
          id: "os-1",
          statusAtual: "ENTREGUE",
          numeroExterno: "2026-001",
        }),
        update: vi.fn(),
      },
      evento: {
        create: vi.fn(),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (mockTx: typeof tx) => unknown) => callback(tx));

    const { POST } = await import("@/app/api/os/[id]/entrega/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/os-1/entrega", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacao: "Cliente retirou no balcao" }),
      }),
      { params: Promise.resolve({ id: "os-1" }) }
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Esta ordem ja foi marcada como entregue",
    });
  });

  it("marks the order as delivered and creates an event", async () => {
    const tx = {
      ordemServico: {
        findUnique: vi.fn().mockResolvedValue({
          id: "os-1",
          statusAtual: "PRONTO",
          numeroExterno: "2026-001",
        }),
        update: vi.fn().mockResolvedValue({
          id: "os-1",
          statusAtual: "ENTREGUE",
        }),
      },
      evento: {
        create: vi.fn().mockResolvedValue({
          id: "ev-1",
          ordemId: "os-1",
          tipo: "ATUALIZACAO",
        }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (mockTx: typeof tx) => unknown) => callback(tx));

    const { POST } = await import("@/app/api/os/[id]/entrega/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/os-1/entrega", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacao: "Cliente conferiu funcionamento" }),
      }),
      { params: Promise.resolve({ id: "os-1" }) }
    );

    expect(response.status).toBe(201);
    expect(tx.ordemServico.update).toHaveBeenCalledWith({
      where: { id: "os-1" },
      data: { statusAtual: "ENTREGUE" },
    });
    expect(tx.evento.create).toHaveBeenCalledWith({
      data: {
        ordemId: "os-1",
        tipo: "ATUALIZACAO",
        descricao: "Equipamento entregue ao cliente. Cliente conferiu funcionamento",
      },
    });
    await expect(response.json()).resolves.toMatchObject({
      ordem: { id: "os-1", numeroExterno: "2026-001" },
      evento: { id: "ev-1" },
    });
  });
});
