import { jsonError, parseJsonBody } from "@/lib/http";
import { authenticateUser, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);

    const username = typeof body === "object" && body !== null && "username" in body ? String(body.username) : "";
    const password = typeof body === "object" && body !== null && "password" in body ? String(body.password) : "";

    if (!username || !password) {
      return jsonError("Username e senha sao obrigatorios", 400);
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return jsonError("Credenciais invalidas", 401);
    }

    await setSessionCookie(user.username, user.isAdmin);
    return Response.json({ ok: true, username: user.username, nome: user.nome, isAdmin: user.isAdmin });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("Corpo JSON invalido", 400);
    }

    console.error("Erro ao autenticar:", error);
    return jsonError("Erro interno do servidor", 500);
  }
}
