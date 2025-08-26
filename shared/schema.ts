import { pgTable, serial, varchar, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull().default("starter"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  template_data: jsonb("template_data").notNull(),
  color_schemes: jsonb("color_schemes").notNull(),
  preview_url: varchar("preview_url", { length: 500 }),
  features: jsonb("features").notNull(),
  seo_optimized: boolean("seo_optimized").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  template_id: integer("template_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  custom_domain: varchar("custom_domain", { length: 255 }),
  site_data: jsonb("site_data").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const ai_generations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  site_id: integer("site_id"),
  generation_type: varchar("generation_type", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  result: jsonb("result").notNull(),
  tokens_used: integer("tokens_used"),
  created_at: timestamp("created_at").defaultNow()
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type InsertSite = typeof sites.$inferInsert;
export type AiGeneration = typeof ai_generations.$inferSelect;
export type InsertAiGeneration = typeof ai_generations.$inferInsert;

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertTemplateSchema = createInsertSchema(templates);
export const insertSiteSchema = createInsertSchema(sites);
export const insertAiGenerationSchema = createInsertSchema(ai_generations);