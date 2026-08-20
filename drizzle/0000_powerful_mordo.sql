CREATE TYPE "public"."lead_status" AS ENUM('Aguardando', 'Em Atendimento', 'Atendido', 'Recusado');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" integer NOT NULL,
	"sourceKey" varchar(191) NOT NULL,
	"placeId" varchar(191),
	"name" varchar(255) NOT NULL,
	"segment" varchar(120) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(40) NOT NULL,
	"phone" varchar(80),
	"address" text,
	"mapsUrl" text,
	"status" "lead_status" DEFAULT 'Aguardando' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "leads_owner_source_unique" ON "leads" USING btree ("ownerId","sourceKey");