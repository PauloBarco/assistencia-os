import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  ordemServico: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("POST /api/os", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/os/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: "",
          origem: "Balcao",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Dados invalidos para criar a ordem de servico",
    });
  });

  it("returns 401 when session is missing", async () => {
    const { POST } = await import("@/app/api/os/route");

    const response = await POST(
      new Request("http://localhost/api/os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: "2026-401",
          origem: "Balcao",
          descricao: "Sem energia",
        }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Nao autenticado",
    });
  });

  it("creates an OS with nested equipamento and recebimento event", async () => {
    prismaMock.ordemServico.create.mockResolvedValue({
      id: "os-1",
      numeroExterno: "2026-001",
      origem: "Balcao",
      descricao: "Sem video",
      equipamento: {
        id: "eq-1",
        tipo: "Notebook",
        marca: "Dell",
        modelo: "Inspiron",
        defeito: "Sem video",
      },
      eventos: [
        {
          id: "ev-1",
          tipo: "RECEBIMENTO",
          descricao: "Equipamento recebido na assistência",
        },
      ],
    });

    const { POST } = await import("@/app/api/os/route");

    const response = await POST(
      authenticatedRequest("http://localhost/api/os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: "2026-001",
          origem: "Balcao",
          descricao: "Sem video",
          tipo: "Notebook",
          marca: "Dell",
          modelo: "Inspiron",
          defeito: "Sem video",
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(prismaMock.ordemServico.create).toHaveBeenCalledWith({
      data: {
        numeroExterno: "2026-001",
        origem: "Balcao",
        descricao: "Sem video",
        equipamento: {
          create: {
            tipo: "Notebook",
            marca: "Dell",
            modelo: "Inspiron",
            defeito: "Sem video",
          },
        },
        eventos: {
          create: {
            tipo: "RECEBIMENTO",
            descricao: "Equipamento recebido na assistência",
          },
        },
      },
      include: {
        equipamento: true,
        eventos: true,
      },
    });
    await expect(response.json()).resolves.toMatchObject({
      id: "os-1",
      numeroExterno: "2026-001",
    });
  });
});
