import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { leads, type InsertLead, type LeadStatus } from "../drizzle/schema";
import { seedLeads } from "./seedLeads";

export async function ensureSeedLeads(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const values: InsertLead[] = seedLeads.map(lead => ({
    ownerId,
    sourceKey: `legacy:${lead.id}`,
    placeId: null,
    name: lead.name,
    segment: lead.segment,
    city: lead.city,
    state: lead.state,
    phone: lead.phone,
    address: null,
    mapsUrl: null,
    status: "Aguardando",
    notes: null,
  }));

  await db.insert(leads).values(values).onDuplicateKeyUpdate({
    set: { updatedAt: new Date() },
  });
}

export async function listLeads(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  return db.select().from(leads).where(eq(leads.ownerId, ownerId)).orderBy(desc(leads.createdAt), desc(leads.id));
}

export async function updateLeadStatus(ownerId: number, leadId: number, status: LeadStatus, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  await db.update(leads)
    .set({ status, ...(notes === undefined ? {} : { notes }) })
    .where(and(eq(leads.ownerId, ownerId), eq(leads.id, leadId)));

  const updated = await db.select().from(leads)
    .where(and(eq(leads.ownerId, ownerId), eq(leads.id, leadId)))
    .limit(1);
  return updated[0] ?? null;
}

export async function importLeads(ownerId: number, incoming: Array<Omit<InsertLead, "ownerId" | "status">>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  if (incoming.length === 0) return [];

  await db.insert(leads).values(incoming.map(lead => ({
    ...lead,
    ownerId,
    status: "Aguardando" as const,
  }))).onDuplicateKeyUpdate({
    set: { updatedAt: new Date() },
  });

  const sourceKeys = incoming.map(lead => lead.sourceKey);
  const imported = [];
  for (const sourceKey of sourceKeys) {
    const row = await db.select().from(leads)
      .where(and(eq(leads.ownerId, ownerId), eq(leads.sourceKey, sourceKey)))
      .limit(1);
    if (row[0]) imported.push(row[0]);
  }
  return imported;
}
