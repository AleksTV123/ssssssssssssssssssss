import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { setupWebSocketServer } from "./websocketHandler";
import { minecraftBot } from "./bot";
import { botConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);

  // Bot status endpoint
  app.get('/api/bot/status', (req, res) => {
    const status = minecraftBot.getStatus();
    res.json(status);
  });

  // Bot configuration endpoint - GET
  app.get('/api/bot/config', (req, res) => {
    const config = minecraftBot.getConfig();
    // Don't send password in the response for security
    const safeConfig = { ...config, password: '' };
    res.json(safeConfig);
  });

  // Bot configuration endpoint - POST
  app.post('/api/bot/config', (req, res) => {
    try {
      const config = botConfigSchema.parse(req.body);
      minecraftBot.setConfig(config);
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
    const success = minecraftBot.start();
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to start bot' });
    }
  });

  // Disconnect bot endpoint
  app.post('/api/bot/disconnect', (req, res) => {
    const success = minecraftBot.stop();
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to stop bot' });
    }
  });

  // Restart bot endpoint
  app.post('/api/bot/restart', (req, res) => {
    const success = minecraftBot.restart();
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
      const success = minecraftBot.sendCommand(command);
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
