import { describe, expect, it } from "vitest";

import {
  validateCreateEventoInput,
  validateCreateOsInput,
  validateUpdateStatusInput,
} from "@/lib/validators";

describe("validators", () => {
  it("accepts a valid OS creation payload", () => {
    const input = validateCreateOsInput({
      numero: " 2026-001 ",
      cliente: " Paulo Silva ",
      descricao: " Cliente informou intermitencia ",
      tipo: " Notebook ",
      marca: " Dell ",
      modelo: " Inspiron ",
      defeito: " Nao liga ",
    });

    expect(input).toEqual({
      numero: "2026-001",
      cliente: "Paulo Silva",
      descricao: "Cliente informou intermitencia",
      tipo: "Notebook",
      marca: "Dell",
      modelo: "Inspiron",
      defeito: "Nao liga",
    });
  });

  it("rejects an OS payload with required fields missing", () => {
    expect(
      validateCreateOsInput({
        numero: "",
        cliente: "Paulo Silva",
      })
    ).toBeNull();
  });

  it("accepts a valid event payload", () => {
    expect(
      validateCreateEventoInput({
        ordemId: "os-1",
        tipo: "AGUARDANDO_APROVACAO",
        descricao: " Cliente precisa aprovar o orcamento ",
      })
    ).toEqual({
      ordemId: "os-1",
      tipo: "AGUARDANDO_APROVACAO",
      descricao: "Cliente precisa aprovar o orcamento",
    });
  });

  it("rejects invalid status updates", () => {
    expect(
      validateUpdateStatusInput({
        id: "os-1",
        status: "INVALIDO",
      })
    ).toBeNull();
  });
});
