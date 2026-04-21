import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  ordemServico: {
    update: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("POST /api/os/update-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/os/update-status/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "os-1",
          status: "INVALIDO",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Dados invalidos para atualizacao de status",
    });
  });

  it("updates the OS status when payload is valid", async () => {
    prismaMock.ordemServico.update.mockResolvedValue({
      id: "os-1",
      statusAtual: "EM_MANUTENCAO",
    });

    const { POST } = await import("@/app/api/os/update-status/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "os-1",
          status: "EM_MANUTENCAO",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.ordemServico.update).toHaveBeenCalledWith({
      where: { id: "os-1" },
      data: {
        statusAtual: "EM_MANUTENCAO",
      },
    });
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns 404 when the OS does not exist", async () => {
    prismaMock.ordemServico.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "5.22.0",
      })
    );

    const { POST } = await import("@/app/api/os/update-status/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "missing-os",
          status: "PRONTO",
        }),
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Ordem de servico nao encontrada",
    });
  });
});
