import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  servicoRealizado: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("DELETE /api/os/[id]/servicos/[servicoId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when service does not belong to the OS", async () => {
    prismaMock.servicoRealizado.findUnique.mockResolvedValue({
      id: "srv-1",
      ordemId: "outra-os",
    });

    const { DELETE } = await import("@/app/api/os/[id]/servicos/[servicoId]/route");

    const response = await DELETE(new Request("http://localhost/api/os/os-1/servicos/srv-1"), {
      params: Promise.resolve({ id: "os-1", servicoId: "srv-1" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Servico realizado nao encontrado para esta ordem",
    });
  });

  it("deletes the service when it belongs to the OS", async () => {
    prismaMock.servicoRealizado.findUnique.mockResolvedValue({
      id: "srv-1",
      ordemId: "os-1",
    });
    prismaMock.servicoRealizado.delete.mockResolvedValue({
      id: "srv-1",
    });

    const { DELETE } = await import("@/app/api/os/[id]/servicos/[servicoId]/route");

    const response = await DELETE(new Request("http://localhost/api/os/os-1/servicos/srv-1"), {
      params: Promise.resolve({ id: "os-1", servicoId: "srv-1" }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.servicoRealizado.delete).toHaveBeenCalledWith({
      where: { id: "srv-1" },
    });
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
