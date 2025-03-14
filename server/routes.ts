import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { setupWebSocketServer } from "./websocketHandler";
import { minecraftBot } from "./bot";
import { minecraft2Bot } from "./bot2";
import { botConfigSchema, botTypeSchema } from "@shared/schema";

// Track which bot is currently active, export for websocket handler
export let activeBotType: "Bot1" | "Bot2" = "Bot1";

// Helper function to get the active bot
const getActiveBot = () => {
  return activeBotType === "Bot1" ? minecraftBot : minecraft2Bot;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);

  // Get active bot type endpoint
  app.get('/api/bot/active', (req, res) => {
    res.json({ activeBot: activeBotType });
  });

  // Switch active bot endpoint
  app.post('/api/bot/switch', (req, res) => {
    try {
      const { botType } = z.object({
        botType: botTypeSchema
      }).parse(req.body);
      
      activeBotType = botType;
      res.json({ success: true, activeBot: activeBotType });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to switch bot' });
      }
    }
  });

  // Bot status endpoint
  app.get('/api/bot/status', (req, res) => {
    const status = getActiveBot().getStatus();
    res.json(status);
  });

  // Bot configuration endpoint - GET
  app.get('/api/bot/config', (req, res) => {
    const config = getActiveBot().getConfig();
    // Don't send password in the response for security
    const safeConfig = { ...config, password: '' };
    res.json(safeConfig);
  });

  // Bot configuration endpoint - POST
  app.post('/api/bot/config', (req, res) => {
    try {
      const config = botConfigSchema.parse(req.body);
      getActiveBot().setConfig(config);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update configuration' });
      }
    }
  });

  // Connect bot endpoint
  app.post('/api/bot/connect', (req, res) => {
    const success = getActiveBot().start();
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to start bot' });
    }
  });

  // Disconnect bot endpoint
  app.post('/api/bot/disconnect', (req, res) => {
    const success = getActiveBot().stop();
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to stop bot' });
    }
  });

  // Restart bot endpoint
  app.post('/api/bot/restart', (req, res) => {
    const success = getActiveBot().restart();
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to restart bot' });
    }
  });

  // Send command endpoint
  app.post('/api/bot/command', (req, res) => {
    const commandSchema = z.object({
      command: z.string().min(1)
    });
    
    try {
      const { command } = commandSchema.parse(req.body);
      const success = getActiveBot().sendCommand(command);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to send command' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Invalid command' });
      }
    }
  });

  return httpServer;
}
