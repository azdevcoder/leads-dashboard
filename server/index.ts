import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerGitHubAuthRoutes } from "./githubAuth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN ?? "https://azdevcoder.github.io")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean),
);

function applyCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (origin) {
    if (!allowedOrigins.has(origin)) {
      res.status(403).json({ error: "Origem não autorizada." });
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
}

app.use(applyCors);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
registerGitHubAuthRoutes(app);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }));

const port = Number(process.env.PORT ?? 10000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Leads Dashboard API escutando na porta ${port}`);
});
