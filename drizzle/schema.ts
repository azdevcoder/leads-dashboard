import { integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const leadStatusEnum = pgEnum("lead_status", ["Aguardando", "Em Atendimento", "Atendido", "Recusado"]);

/** Core user table backed by GitHub OAuth identities. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const leadStatus = ["Aguardando", "Em Atendimento", "Atendido", "Recusado"] as const;
export type LeadStatus = (typeof leadStatus)[number];

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  ownerId: integer("ownerId").notNull(),
  sourceKey: varchar("sourceKey", { length: 191 }).notNull(),
  placeId: varchar("placeId", { length: 191 }),
  name: varchar("name", { length: 255 }).notNull(),
  segment: varchar("segment", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 40 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  address: text("address"),
  mapsUrl: text("mapsUrl"),
  status: leadStatusEnum("status").default("Aguardando").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => ({
  ownerSourceUnique: uniqueIndex("leads_owner_source_unique").on(table.ownerId, table.sourceKey),
}));

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
