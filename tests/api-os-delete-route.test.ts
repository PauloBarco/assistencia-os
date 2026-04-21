import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  $transaction: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("DELETE /api/os/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when id is empty", async () => {
    const { DELETE } = await import("@/app/api/os/[id]/route");

    const response = await DELETE(authenticatedRequest("http://localhost/api/os/"), {
      params: Promise.resolve({ id: "" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Identificador da ordem invalido",
    });
  });

  it("deletes related records before removing the OS", async () => {
    const tx = {
      evento: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
      servicoRealizado: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      equipamento: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      ordemServico: { delete: vi.fn().mockResolvedValue({ id: "os-1" }) },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (mockTx: typeof tx) => unknown) => callback(tx));

    const { DELETE } = await import("@/app/api/os/[id]/route");

    const response = await DELETE(authenticatedRequest("http://localhost/api/os/os-1"), {
      params: Promise.resolve({ id: "os-1" }),
    });

    expect(response.status).toBe(200);
    expect(tx.evento.deleteMany).toHaveBeenCalledWith({ where: { ordemId: "os-1" } });
    expect(tx.servicoRealizado.deleteMany).toHaveBeenCalledWith({ where: { ordemId: "os-1" } });
    expect(tx.equipamento.deleteMany).toHaveBeenCalledWith({ where: { ordemId: "os-1" } });
    expect(tx.ordemServico.delete).toHaveBeenCalledWith({ where: { id: "os-1" } });
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
