import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticatedRequest } from "./auth-helpers";

const prismaMock = {
  evento: {
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("PUT /api/evento/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const { PUT } = await import("@/app/api/evento/[id]/route");

    const response = await PUT(
      authenticatedRequest("http://localhost/api/evento/ev-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: "" }),
      }),
      { params: Promise.resolve({ id: "ev-1" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Dados invalidos para atualizar evento",
    });
  });

  it("updates the event description", async () => {
    prismaMock.evento.update.mockResolvedValue({
      id: "ev-1",
      descricao: "Descricao atualizada",
    });

    const { PUT } = await import("@/app/api/evento/[id]/route");

    const response = await PUT(
      authenticatedRequest("http://localhost/api/evento/ev-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: "Descricao atualizada" }),
      }),
      { params: Promise.resolve({ id: "ev-1" }) }
    );

    expect(response.status).toBe(200);
    expect(prismaMock.evento.update).toHaveBeenCalledWith({
      where: { id: "ev-1" },
      data: { descricao: "Descricao atualizada" },
    });
  });
});

describe("DELETE /api/evento/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the event", async () => {
    prismaMock.evento.delete.mockResolvedValue({ id: "ev-1" });

    const { DELETE } = await import("@/app/api/evento/[id]/route");

    const response = await DELETE(authenticatedRequest("http://localhost/api/evento/ev-1"), {
      params: Promise.resolve({ id: "ev-1" }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.evento.delete).toHaveBeenCalledWith({
      where: { id: "ev-1" },
    });
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
