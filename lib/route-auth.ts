import type { SessionPayload } from "@/lib/auth";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError } from "@/lib/http";

type SessionResult =
  | { session: SessionPayload; actor: string }
  | { response: Response };

export function requireRequestSession(request: Request): SessionResult {
  const session = getSessionFromRequest(request);

  if (!session) {
    return { response: jsonError("Nao autenticado", 401) };
  }

  return {
    session,
    actor: session.username,
  };
}
