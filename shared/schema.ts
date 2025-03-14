import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing schema as it might be needed)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bot configuration schema
export const botConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  username: z.string().min(1),
  version: z.string().min(1),
  password: z.string().optional()
});

export type BotConfig = z.infer<typeof botConfigSchema>;

// Bot status schema
export const botStatusSchema = z.object({
  connected: z.boolean(),
  server: z.boolean(),
  serverAddress: z.string(),
  uptime: z.string(),
  reconnectAttempts: z.number(),
  lastReconnectTime: z.string(),
  lastRestart: z.string(),
  activity: z.string(),
  lastAction: z.string()
});

export type BotStatus = z.infer<typeof botStatusSchema>;
