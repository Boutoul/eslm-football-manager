import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  preferredPosition: text("preferred_position").notNull(),
  strongFoot: text("strong_foot").notNull(),
  overallRating: integer("overall_rating").notNull().default(1),
  speed: integer("speed").notNull().default(1),
  endurance: integer("endurance").notNull().default(1),
  technique: integer("technique").notNull().default(1),
  heading: integer("heading").notNull().default(1),
  physical: integer("physical").notNull().default(1),
  activities: jsonb("activities").notNull().default({}),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  formation: text("formation").notNull(),
  playerPositions: jsonb("player_positions").notNull().default({}),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pointsConfig: jsonb("points_config").notNull().default({}),
  activitiesConfig: jsonb("activities_config").notNull().default({}),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
}).extend({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  preferredPosition: z.enum(["goalkeeper", "defender", "midfielder", "attacker"]),
  strongFoot: z.enum(["left", "right", "both"]),
  overallRating: z.number().min(1).max(3),
  speed: z.number().min(1).max(3),
  endurance: z.number().min(1).max(3),
  technique: z.number().min(1).max(3),
  heading: z.number().min(1).max(3),
  physical: z.number().min(1).max(3),
  activities: z.record(z.boolean().optional()).default({}),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Le nom de l'équipe est requis"),
  formation: z.string().min(1, "La formation est requise"),
  playerPositions: z.record(z.string()).default({}),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
}).extend({
  pointsConfig: z.record(z.number()),
  activitiesConfig: z.record(z.object({
    label: z.string(),
    points: z.number(),
    category: z.string(),
  })),
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
