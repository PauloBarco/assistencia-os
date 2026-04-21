import { Status, TipoEvento } from "@prisma/client";

import { isNonEmptyString, isRecord, optionalTrimmedString } from "@/lib/http";

export type CreateOsInput = {
  numero: string;
  origem: string;
  descricao?: string;
  tipo: string;
  marca: string;
  modelo: string;
  defeito: string;
};

export type CreateEventoInput = {
  ordemId: string;
  tipo: TipoEvento;
  descricao: string;
};

export type UpdateStatusInput = {
  id: string;
  status: Status;
};

export type UpdateOsInput = {
  numero: string;
  origem: string;
  descricao?: string;
  tipo: string;
  marca: string;
  modelo: string;
  serial?: string;
  defeito: string;
};

export type CreateServicoInput = {
  ordemId: string;
  descricao: string;
  tecnico?: string;
};

export type DeliverOsInput = {
  observacao?: string;
};

export function validateCreateOsInput(payload: unknown): CreateOsInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    !isNonEmptyString(payload.numero) ||
    !isNonEmptyString(payload.origem) ||
    !isNonEmptyString(payload.tipo) ||
    !isNonEmptyString(payload.marca) ||
    !isNonEmptyString(payload.modelo) ||
    !isNonEmptyString(payload.defeito)
  ) {
    return null;
  }

  return {
    numero: payload.numero.trim(),
    origem: payload.origem.trim(),
    descricao: optionalTrimmedString(payload.descricao),
    tipo: payload.tipo.trim(),
    marca: payload.marca.trim(),
    modelo: payload.modelo.trim(),
    defeito: payload.defeito.trim(),
  };
}

export function validateCreateEventoInput(payload: unknown): CreateEventoInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    !isNonEmptyString(payload.ordemId) ||
    !isNonEmptyString(payload.descricao) ||
    !isNonEmptyString(payload.tipo)
  ) {
    return null;
  }

  const tipo = payload.tipo.trim();

  if (!Object.values(TipoEvento).includes(tipo as TipoEvento)) {
    return null;
  }

  return {
    ordemId: payload.ordemId.trim(),
    tipo: tipo as TipoEvento,
    descricao: payload.descricao.trim(),
  };
}

export function validateUpdateStatusInput(payload: unknown): UpdateStatusInput | null {
  if (!isRecord(payload) || !isNonEmptyString(payload.id) || !isNonEmptyString(payload.status)) {
    return null;
  }

  const status = payload.status.trim();

  if (!Object.values(Status).includes(status as Status)) {
    return null;
  }

  return {
    id: payload.id.trim(),
    status: status as Status,
  };
}

export function validateUpdateOsInput(payload: unknown): UpdateOsInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    !isNonEmptyString(payload.numero) ||
    !isNonEmptyString(payload.origem) ||
    !isNonEmptyString(payload.tipo) ||
    !isNonEmptyString(payload.marca) ||
    !isNonEmptyString(payload.modelo) ||
    !isNonEmptyString(payload.defeito)
  ) {
    return null;
  }

  return {
    numero: payload.numero.trim(),
    origem: payload.origem.trim(),
    descricao: optionalTrimmedString(payload.descricao),
    tipo: payload.tipo.trim(),
    marca: payload.marca.trim(),
    modelo: payload.modelo.trim(),
    serial: optionalTrimmedString(payload.serial),
    defeito: payload.defeito.trim(),
  };
}

export function validateCreateServicoInput(payload: unknown): CreateServicoInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (!isNonEmptyString(payload.ordemId) || !isNonEmptyString(payload.descricao)) {
    return null;
  }

  return {
    ordemId: payload.ordemId.trim(),
    descricao: payload.descricao.trim(),
    tecnico: optionalTrimmedString(payload.tecnico),
  };
}

export function validateDeliverOsInput(payload: unknown): DeliverOsInput | null {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    observacao: optionalTrimmedString(payload.observacao),
  };
}
