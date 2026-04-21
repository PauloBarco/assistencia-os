import { jsonError, parseJsonBody } from "@/lib/http";
import { getConfiguredPassword, getConfiguredUsername, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);

    const username = typeof body === "object" && body !== null && "username" in body ? String(body.username) : "";
    const password = typeof body === "object" && body !== null && "password" in body ? String(body.password) : "";

    if (username !== getConfiguredUsername() || password !== getConfiguredPassword()) {
      return jsonError("Credenciais invalidas", 401);
    }

    await setSessionCookie(username);
    return Response.json({ ok: true, username });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    console.error("Erro ao autenticar:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
