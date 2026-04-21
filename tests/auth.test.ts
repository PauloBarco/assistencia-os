import { describe, expect, it } from "vitest";
import "./auth-helpers";

import { createSessionToken, getSessionFromCookieHeader, verifySessionToken } from "@/lib/auth";
import { requireRequestSession } from "@/lib/route-auth";

describe("auth helpers", () => {
  it("creates and validates a session token", () => {
    const token = createSessionToken("admin");

    expect(verifySessionToken(token)).toMatchObject({
      username: "admin",
    });
  });

  it("reads session from cookie header", () => {
    const token = createSessionToken("paulo");
    const session = getSessionFromCookieHeader(`assistencia_session=${token}`);

    expect(session).toMatchObject({
      username: "paulo",
    });
  });

  it("returns 401 response when request is not authenticated", async () => {
    const result = requireRequestSession(new Request("http://localhost/api/os"));

    expect("response" in result).toBe(true);

    if ("response" in result) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toEqual({
        error: "Nao autenticado",
      });
    }
  });
});
