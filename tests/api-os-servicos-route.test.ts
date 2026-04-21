import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  servicoRealizado: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("POST /api/os/[id]/servicos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/os/[id]/servicos/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/os-1/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordemId: "os-1", descricao: "" }),
      }),
      { params: Promise.resolve({ id: "os-1" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Dados invalidos para registrar servico",
    });
  });

  it("creates a service record for the current OS", async () => {
    prismaMock.servicoRealizado.create.mockResolvedValue({
      id: "srv-1",
      ordemId: "os-1",
      descricao: "Troca de conector DC",
      tecnico: "Paulo",
    });

    const { POST } = await import("@/app/api/os/[id]/servicos/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os/os-1/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordemId: "os-1",
          descricao: "Troca de conector DC",
          tecnico: "Paulo",
        }),
      }),
      { params: Promise.resolve({ id: "os-1" }) }
    );

    expect(response.status).toBe(201);
    expect(prismaMock.servicoRealizado.create).toHaveBeenCalledWith({
      data: {
        ordemId: "os-1",
        descricao: "Troca de conector DC",
        tecnico: "Paulo",
      },
    });
    await expect(response.json()).resolves.toMatchObject({
      id: "srv-1",
      ordemId: "os-1",
    });
  });
});
