import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("PUT /api/os/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { PUT } = await import("@/app/api/os/[id]/route");

    const response = await PUT(
      new Request("http://localhost/api/os/os-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: "", origem: "Balcao" }),
      }),
      { params: Promise.resolve({ id: "os-1" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Dados invalidos para atualizar a ordem de servico",
    });
  });

  it("updates OS and equipamento inside a transaction", async () => {
    const tx = {
      ordemServico: {
        update: vi.fn().mockResolvedValue({ id: "os-1", numeroExterno: "2026-777", origem: "Parceiro" }),
      },
      equipamento: {
        update: vi.fn().mockResolvedValue({ ordemId: "os-1" }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (mockTx: typeof tx) => unknown) => callback(tx));

    const { PUT } = await import("@/app/api/os/[id]/route");

    const response = await PUT(
      new Request("http://localhost/api/os/os-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: "2026-777",
          origem: "Parceiro",
          descricao: "Atualizada",
          tipo: "Notebook",
          marca: "Lenovo",
          modelo: "ThinkPad",
          serial: "SN-123",
          defeito: "Sem imagem",
        }),
      }),
      { params: Promise.resolve({ id: "os-1" }) }
    );

    expect(response.status).toBe(200);
    expect(tx.ordemServico.update).toHaveBeenCalledWith({
      where: { id: "os-1" },
      data: {
        numeroExterno: "2026-777",
        origem: "Parceiro",
        descricao: "Atualizada",
      },
    });
    expect(tx.equipamento.update).toHaveBeenCalledWith({
      where: { ordemId: "os-1" },
      data: {
        tipo: "Notebook",
        marca: "Lenovo",
        modelo: "ThinkPad",
        serial: "SN-123",
        defeito: "Sem imagem",
      },
    });
    await expect(response.json()).resolves.toMatchObject({
      id: "os-1",
      numeroExterno: "2026-777",
    });
  });
});
