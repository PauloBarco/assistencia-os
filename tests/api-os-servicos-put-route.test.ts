import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  servicoRealizado: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("PUT /api/os/[id]/servicos/[servicoId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { PUT } = await import("@/app/api/os/[id]/servicos/[servicoId]/route");

    const response = await PUT(
      authenticatedRequest("http://localhost/api/os/os-1/servicos/srv-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: "" }),
      }),
      { params: Promise.resolve({ id: "os-1", servicoId: "srv-1" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Dados invalidos para atualizar servico",
    });
  });

  it("updates service when it belongs to the OS", async () => {
    prismaMock.servicoRealizado.findUnique.mockResolvedValue({
      id: "srv-1",
      ordemId: "os-1",
    });
    prismaMock.servicoRealizado.update.mockResolvedValue({
      id: "srv-1",
      descricao: "Limpeza tecnica",
      tecnico: "Paulo",
    });

    const { PUT } = await import("@/app/api/os/[id]/servicos/[servicoId]/route");

    const response = await PUT(
      authenticatedRequest("http://localhost/api/os/os-1/servicos/srv-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: "Limpeza tecnica",
          tecnico: "Paulo",
        }),
      }),
      { params: Promise.resolve({ id: "os-1", servicoId: "srv-1" }) }
    );

    expect(response.status).toBe(200);
    expect(prismaMock.servicoRealizado.update).toHaveBeenCalledWith({
      where: { id: "srv-1" },
      data: {
        descricao: "Limpeza tecnica",
        tecnico: "Paulo",
      },
    });
  });
});
