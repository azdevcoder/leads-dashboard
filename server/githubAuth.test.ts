import { describe, expect, it, vi } from "vitest";

vi.stubEnv("JWT_SECRET", "test-secret-with-enough-length");
vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "github-client-id");
vi.stubEnv("API_PUBLIC_URL", "https://api.example.com");

describe("GitHub OAuth", () => {
  it("cria uma autorização com state aleatório e PKCE S256", async () => {
    const { createGitHubLoginAttempt } = await import("./githubAuth");
    const attempt = createGitHubLoginAttempt();
    const url = new URL(attempt.authorizationUrl);

    expect(url.origin).toBe("https://github.com");
    expect(url.searchParams.get("redirect_uri")).toBe("https://api.example.com/api/auth/github/callback");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toHaveLength(43);
    expect(attempt.cookieValue).toContain(".");
  });
});
