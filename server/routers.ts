import { publicProcedure, router } from "./_core/trpc";
import { leadsRouter } from "./routers/leads";

export const appRouter = router({
  system: router({
    health: publicProcedure.query(() => ({ ok: true })),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),
  leads: leadsRouter,
});

export type AppRouter = typeof appRouter;
