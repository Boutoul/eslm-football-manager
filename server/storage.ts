import { type Player, type InsertPlayer, type Team, type InsertTeam, type Settings, type InsertSettings, players, teams, settings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;
  
  // Teams
  getTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private players: Map<string, Player>;
  private teams: Map<string, Team>;
  private settings: Settings | undefined;

  constructor() {
    this.players = new Map();
    this.teams = new Map();
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings() {
    this.settings = {
      id: randomUUID(),
      pointsConfig: {
        starValue: 10,
        strongFoot: {
          left: 2,
          right: 1,
          both: 3
        },
        skillValue: 1
      },
      activitiesConfig: {
        alreadyExcluded: { label: "Déjà écarté", points: 2, category: "status" },
        goalkeeperAccepted: { label: "Gardien accepté", points: 5, category: "position" },
        defenderAccepted: { label: "Défenseur accepté", points: 3, category: "position" },
        midfielderAccepted: { label: "Milieu accepté", points: 1, category: "position" },
        attackerAccepted: { label: "Attaquant accepté", points: 1, category: "position" },
        trainingAttendance: { label: "Présence entraînement", points: 1, category: "attendance" },
        eventAttendance: { label: "Présence évènement", points: 1, category: "attendance" },
        lineDrawing: { label: "Traçage", points: 1, category: "tasks" },
        lockerCleaning: { label: "Nettoyage vestiaire", points: 1, category: "tasks" },
        jerseys: { label: "Maillots", points: 1, category: "tasks" },
        extra: { label: "Extra", points: 1, category: "tasks" },
        lineRefereeing: { label: "Arbitrage touche", points: 1, category: "refereeing" },
        centerRefereeing: { label: "Arbitrage centre", points: 1, category: "refereeing" },
        unjustifiedAbsence: { label: "Absence injustifié", points: -5, category: "negative" },
        badBehavior: { label: "Mauvais comportement", points: -10, category: "negative" }
      }
    };
  }

  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      createdAt: new Date().toISOString(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;

    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const team: Team = {
      ...insertTeam,
      id,
      createdAt: new Date().toISOString(),
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;

    const updatedTeam = { ...team, ...updates };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    return this.teams.delete(id);
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(updates: InsertSettings): Promise<Settings> {
    this.settings = {
      id: this.settings?.id || randomUUID(),
      ...updates,
    };
    return this.settings;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Initialize default settings on first run
  private async ensureDefaultSettings(): Promise<void> {
    const existingSettings = await this.getSettings();
    if (!existingSettings) {
      await this.updateSettings({
        pointsConfig: {
          starValue: 10,
          strongFoot: {
            left: 2,
            right: 1,
            both: 3
          },
          skillValue: 1
        } as any,
        activitiesConfig: {
          alreadyExcluded: { label: "Déjà écarté", points: 2, category: "status" },
          goalkeeperAccepted: { label: "Gardien accepté", points: 5, category: "position" },
          defenderAccepted: { label: "Défenseur accepté", points: 3, category: "position" },
          midfielderAccepted: { label: "Milieu accepté", points: 1, category: "position" },
          attackerAccepted: { label: "Attaquant accepté", points: 1, category: "position" },
          trainingAttendance: { label: "Présence entraînement", points: 1, category: "attendance" },
          eventAttendance: { label: "Présence évènement", points: 1, category: "attendance" },
          lineDrawing: { label: "Traçage", points: 1, category: "tasks" },
          lockerCleaning: { label: "Nettoyage vestiaire", points: 1, category: "tasks" },
          jerseys: { label: "Maillots", points: 1, category: "tasks" },
          extra: { label: "Extra", points: 1, category: "tasks" },
          lineRefereeing: { label: "Arbitrage touche", points: 1, category: "refereeing" },
          centerRefereeing: { label: "Arbitrage centre", points: 1, category: "refereeing" },
          unjustifiedAbsence: { label: "Absence injustifié", points: -5, category: "negative" },
          badBehavior: { label: "Mauvais comportement", points: -10, category: "negative" }
        }
      });
    }
  }

  async getPlayers(): Promise<Player[]> {
    await this.ensureDefaultSettings();
    return await db.select().from(players);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    await this.ensureDefaultSettings();
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    await this.ensureDefaultSettings();
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    await this.ensureDefaultSettings();
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async deletePlayer(id: string): Promise<boolean> {
    await this.ensureDefaultSettings();
    const result = await db.delete(players).where(eq(players.id, id));
    return (result as any).rowCount > 0;
  }

  async getTeams(): Promise<Team[]> {
    await this.ensureDefaultSettings();
    return await db.select().from(teams);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    await this.ensureDefaultSettings();
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    await this.ensureDefaultSettings();
    const [team] = await db
      .insert(teams)
      .values(insertTeam)
      .returning();
    return team;
  }

  async updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team | undefined> {
    await this.ensureDefaultSettings();
    const [team] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return team || undefined;
  }

  async deleteTeam(id: string): Promise<boolean> {
    await this.ensureDefaultSettings();
    const result = await db.delete(teams).where(eq(teams.id, id));
    return (result as any).rowCount > 0;
  }

  async getSettings(): Promise<Settings | undefined> {
    const [settingsRecord] = await db.select().from(settings).limit(1);
    return settingsRecord || undefined;
  }

  async updateSettings(updates: InsertSettings): Promise<Settings> {
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(settings)
        .set(updates)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values(updates)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
