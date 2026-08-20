import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const leadStatus = ["Aguardando", "Em Atendimento", "Atendido", "Recusado"] as const;
export type LeadStatus = (typeof leadStatus)[number];

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  sourceKey: varchar("sourceKey", { length: 191 }).notNull(),
  placeId: varchar("placeId", { length: 191 }),
  name: varchar("name", { length: 255 }).notNull(),
  segment: varchar("segment", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 40 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  address: text("address"),
  mapsUrl: text("mapsUrl"),
  status: mysqlEnum("status", leadStatus).default("Aguardando").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  ownerSourceUnique: uniqueIndex("leads_owner_source_unique").on(table.ownerId, table.sourceKey),
}));

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
