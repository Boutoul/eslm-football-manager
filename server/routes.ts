import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertTeamSchema, insertSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Players routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des joueurs" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ message: "Joueur non trouvé" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du joueur" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error: (error as Error).message });
    }
  });

  app.put("/api/players/:id", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(req.params.id, validatedData);
      if (!player) {
        return res.status(404).json({ message: "Joueur non trouvé" });
      }
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error: (error as Error).message });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const success = await storage.deletePlayer(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Joueur non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du joueur" });
    }
  });

  // Teams routes
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des équipes" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'équipe" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error: (error as Error).message });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(req.params.id, validatedData);
      if (!team) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error: (error as Error).message });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeam(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression de l'équipe" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
