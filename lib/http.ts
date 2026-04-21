export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function optionalTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}
