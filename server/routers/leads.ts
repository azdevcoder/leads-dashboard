import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { leadStatus } from "../../drizzle/schema";
import { searchGooglePlaces } from "../googlePlaces";
import { ensureSeedLeads, importLeads, listLeads, updateLeadStatus } from "../leadsDb";
import { protectedProcedure, router } from "../_core/trpc";

const statusSchema = z.enum(leadStatus);

export const leadsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await ensureSeedLeads(ctx.user.id);
    return listLeads(ctx.user.id);
  }),

  search: protectedProcedure
    .input(z.object({
      query: z.string().trim().min(2).max(120),
      city: z.string().trim().min(2).max(120),
      state: z.string().trim().min(2).max(40),
      limit: z.number().int().min(1).max(20).default(10),
    }))
    .mutation(async ({ input }) => {
      try {
        return await searchGooglePlaces(input);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível pesquisar no Google Places";
        throw new TRPCError({ code: "BAD_GATEWAY", message });
      }
    }),

  importMany: protectedProcedure
    .input(z.object({
      leads: z.array(z.object({
        sourceKey: z.string().min(1).max(191),
        placeId: z.string().max(191).nullable().optional(),
        name: z.string().trim().min(1).max(255),
        segment: z.string().trim().min(1).max(120),
        city: z.string().trim().min(1).max(120),
        state: z.string().trim().min(1).max(40),
        phone: z.string().max(80).nullable().optional(),
        address: z.string().max(2000).nullable().optional(),
        mapsUrl: z.string().url().max(2000).nullable().optional(),
      })).min(1).max(20),
    }))
    .mutation(async ({ ctx, input }) => {
      return importLeads(ctx.user.id, input.leads.map(lead => ({
        ...lead,
        placeId: lead.placeId ?? null,
        phone: lead.phone ?? null,
        address: lead.address ?? null,
        mapsUrl: lead.mapsUrl ?? null,
      })));
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      status: statusSchema,
      notes: z.string().max(5000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updated = await updateLeadStatus(ctx.user.id, input.id, input.status, input.notes);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Lead não encontrado" });
      return updated;
    }),
});
