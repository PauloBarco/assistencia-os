import type { SessionPayload } from "@/lib/auth";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { hasPermission, type UserPermissionKey } from "@/lib/permissions";

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

export function requirePermission(request: Request, permission: UserPermissionKey): SessionResult {
  const auth = requireRequestSession(request);

  if ("response" in auth) {
    return auth;
  }

  if (!hasPermission(auth.session, permission)) {
    return { response: jsonError("Sem permissao para esta acao", 403) };
  }

  return auth;
}
