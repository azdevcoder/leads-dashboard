import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookie } from "cookie";
import type { User } from "../drizzle/schema";
import * as db from "./db";

const OAUTH_ATTEMPT_TTL_SECONDS = 10 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 8 * 60 * 60;
const ISSUER = "leads-dashboard-api";

type OAuthAttempt = { state: string; verifier: string };

function oauthAttemptCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-github_oauth" : "github_oauth";
}

function base64Url(bytes: Buffer) {
  return bytes.toString("base64url");
}

function configured(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} não configurada no servidor.`);
  return value;
}

function signingKey() {
  return new TextEncoder().encode(configured("JWT_SECRET"));
}

function signedAttempt(value: OAuthAttempt) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  const signature = createHmac("sha256", configured("JWT_SECRET")).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSignedAttempt(value?: string): OAuthAttempt | null {
  if (!value) return null;
  const [payload, receivedSignature] = value.split(".");
  if (!payload || !receivedSignature) return null;
  const expectedSignature = createHmac("sha256", configured("JWT_SECRET")).update(payload).digest("base64url");
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthAttempt;
    return typeof decoded.state === "string" && typeof decoded.verifier === "string" ? decoded : null;
  } catch {
    return null;
  }
}

function callbackUrl() {
  return `${configured("API_PUBLIC_URL").replace(/\/$/, "")}/api/auth/github/callback`;
}

function frontendOrigin() {
  return configured("FRONTEND_ORIGIN").split(",")[0]!.trim().replace(/\/$/, "");
}

export function createGitHubLoginAttempt() {
  const state = base64Url(randomBytes(32));
  const verifier = base64Url(randomBytes(64));
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", configured("GITHUB_OAUTH_CLIENT_ID"));
  url.searchParams.set("redirect_uri", callbackUrl());
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return { authorizationUrl: url.toString(), cookieValue: signedAttempt({ state, verifier }) };
}

type GitHubTokenResponse = { access_token?: string; error?: string; error_description?: string };
type GitHubProfile = { id?: number; login?: string; name?: string | null; email?: string | null };

async function exchangeCode(code: string, verifier: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: configured("GITHUB_OAUTH_CLIENT_ID"),
      client_secret: configured("GITHUB_OAUTH_CLIENT_SECRET"),
      code,
      redirect_uri: callbackUrl(),
      code_verifier: verifier,
    }),
  });
  const payload = await response.json() as GitHubTokenResponse;
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? payload.error ?? "Falha ao obter token do GitHub.");
  return payload.access_token;
}

async function getGitHubProfile(accessToken: string) {
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${accessToken}` };
  const profileResponse = await fetch("https://api.github.com/user", { headers });
  const profile = await profileResponse.json() as GitHubProfile;
  if (!profileResponse.ok || !profile.id || !profile.login) throw new Error("Não foi possível validar a identidade no GitHub.");
  let email = profile.email ?? null;
  if (!email) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }>;
      email = emails.find(item => item.primary && item.verified)?.email ?? emails.find(item => item.verified)?.email ?? null;
    }
  }
  return { id: profile.id, login: profile.login, name: profile.name ?? profile.login, email };
}

export async function issueAccessToken(user: User) {
  return new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(signingKey());
}

export async function authenticateAccessToken(header?: string) {
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), signingKey(), { algorithms: ["HS256"], issuer: ISSUER });
    const userId = payload.userId;
    if (typeof userId !== "number") return null;
    const database = await db.getDb();
    if (!database) return null;
    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await database.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0] ?? null;
  } catch {
    return null;
  }
}

function redirectWithError(res: Response, message: string) {
  const destination = new URL(frontendOrigin());
  destination.searchParams.set("authError", message);
  res.redirect(destination.toString());
}

export function registerGitHubAuthRoutes(app: Express) {
  app.get("/api/auth/github/login", (_req, res) => {
    try {
      const attempt = createGitHubLoginAttempt();
      res.cookie(oauthAttemptCookieName(), attempt.cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: OAUTH_ATTEMPT_TTL_SECONDS * 1000,
      });
      res.redirect(attempt.authorizationUrl);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Não foi possível iniciar o login." });
    }
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    res.clearCookie(oauthAttemptCookieName(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    try {
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const state = typeof req.query.state === "string" ? req.query.state : "";
      const attempt = readSignedAttempt(parseCookie(req.headers.cookie ?? "")[oauthAttemptCookieName()]);
      if (!code || !attempt || state !== attempt.state) {
        redirectWithError(res, "A validação do login expirou ou não corresponde ao pedido original.");
        return;
      }
      const providerToken = await exchangeCode(code, attempt.verifier);
      const profile = await getGitHubProfile(providerToken);
      await db.upsertUser({
        openId: `github:${profile.id}`,
        name: profile.name,
        email: profile.email,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });
      const user = await db.getUserByOpenId(`github:${profile.id}`);
      if (!user) throw new Error("A conta não pôde ser criada no banco de dados.");
      const accessToken = await issueAccessToken(user);
      const destination = new URL(frontendOrigin());
      destination.hash = new URLSearchParams({ access_token: accessToken }).toString();
      res.redirect(destination.toString());
    } catch (error) {
      redirectWithError(res, error instanceof Error ? error.message : "Não foi possível concluir o login.");
    }
  });
}
