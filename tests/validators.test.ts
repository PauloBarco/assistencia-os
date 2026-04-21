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
      origem: " Balcao ",
      descricao: " Cliente informou intermitencia ",
      tipo: " Notebook ",
      marca: " Dell ",
      modelo: " Inspiron ",
      defeito: " Nao liga ",
    });

    expect(input).toEqual({
      numero: "2026-001",
      origem: "Balcao",
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
        origem: "Balcao",
      })
    ).toBeNull();
  });

  it("accepts a valid event payload", () => {
    expect(
      validateCreateEventoInput({
        ordemId: "os-1",
        tipo: "FINALIZADO",
        descricao: " Equipamento testado e pronto ",
      })
    ).toEqual({
      ordemId: "os-1",
      tipo: "FINALIZADO",
      descricao: "Equipamento testado e pronto",
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
