import mineflayer from 'mineflayer';
import { WebSocket } from 'ws';
import { BotConfig, BotStatus } from '../shared/schema';

class Minecraft2Bot {
  private bot: mineflayer.Bot | null = null;
  private config: BotConfig = {
    host: 'pieseczkowomc2016.icsv.pl',
    port: 25565,
    username: 'FOKIPOFMC1',
    version: '1.21',
    password: 'haslo123'
  };
  private clients: Set<WebSocket> = new Set();
  private reconnectInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private startTime: Date | null = null;
  private lastRestartTime: Date | null = null;
  private lastReconnectTime: Date | null = null;
  private lastAction: string = 'None';
  private status: BotStatus = {
    connected: false,
    server: false,
    serverAddress: '',
    uptime: '0h 0m 0s',
    reconnectAttempts: 0,
    lastReconnectTime: 'Never',
    lastRestart: 'Never',
    activity: 'Inactive',
    lastAction: 'None'
  };
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000; // 5 seconds

  constructor() {
    // Initialize with default configuration
    this.updateStatusLive();
  }

  // Add a client to broadcast messages to
  public addClient(client: WebSocket): void {
    this.clients.add(client);
    
    // When a client connects, send them the current status
    this.broadcastStatus();
  }

  // Remove a client when disconnected
  public removeClient(client: WebSocket): void {
    this.clients.delete(client);
  }

  // Set the bot configuration
  public setConfig(newConfig: BotConfig): void {
    this.config = { ...newConfig };
    this.log(`Bot configuration updated`, 'system');
  }

  // Get the current bot configuration
  public getConfig(): BotConfig {
    return { ...this.config };
  }

  // Get the current bot status
  public getStatus(): BotStatus {
    this.updateStatusLive();
    return { ...this.status };
  }

  // Start the bot with the current configuration
  public start(): boolean {
    if (this.bot) {
      this.log('Bot is already running', 'warning');
      return false;
    }

    try {
      this.log(`Starting bot with config: ${this.config.username}@${this.config.host}:${this.config.port}`, 'system');
      
      this.bot = mineflayer.createBot({
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        version: this.config.version,
      });

      this.setupEventListeners();
      this.startTime = new Date();
      this.lastRestartTime = new Date();
      this.status.connected = true;
      this.status.server = true;
      this.status.serverAddress = `${this.config.host}:${this.config.port}`;
      this.status.activity = 'Connecting';
      
      this.broadcastStatus();
      return true;
    } catch (error) {
      this.log(`Error starting bot: ${error}`, 'error');
      return false;
    }
  }

  // Flag to track if disconnect was manual
  private manualDisconnect: boolean = false;

  // Stop the bot
  public stop(): boolean {
    if (!this.bot) {
      this.log('Bot is not running', 'warning');
      return false;
    }

    try {
      this.log('Disconnecting bot', 'system');
      this.manualDisconnect = true; // Mark as manual disconnect
      this.bot.quit();
      this.bot = null;
      this.status.connected = false;
      this.status.activity = 'Inactive';
      this.broadcastStatus();
      return true;
    } catch (error) {
      this.log(`Error stopping bot: ${error}`, 'error');
      return false;
    }
  }

  // Restart the bot
  public restart(): boolean {
    this.log('Restarting bot', 'system');
    const wasRunning = this.bot !== null;
    
    if (wasRunning) {
      this.stop();
    }
    
    // Wait a moment before restarting
    setTimeout(() => {
      this.start();
      this.lastRestartTime = new Date();
      this.status.lastRestart = this.formatTimeDifference(this.lastRestartTime);
      this.broadcastStatus();
    }, 1000);
    
    return true;
  }

  // Send a custom command to the bot
  public sendCommand(command: string): boolean {
    if (!this.bot) {
      this.log('Cannot send command: Bot is not connected', 'error');
      return false;
    }

    try {
      this.log(`Sending command: ${command}`, 'warning');
      this.bot?.chat(command); // Use optional chaining to fix null check
      this.lastAction = `Command: ${command}`;
      this.status.lastAction = this.lastAction;
      this.broadcastStatus();
      return true;
    } catch (error) {
      this.log(`Error sending command: ${error}`, 'error');
      return false;
    }
  }

  // Set up the bot event listeners
  private setupEventListeners(): void {
    if (!this.bot) return;

    // Spawn event
    this.bot.on('spawn', () => {
      this.log('Bot has spawned!');
      
      // Send login command if password is configured
      if (this.config.password && this.bot) {
        this.log(`Sending login command: /login ${this.config.password.replace(/./g, '*')}`, 'warning');
        this.bot.chat(`/login ${this.config.password}`);
      }
      
      this.status.activity = 'Active';
      this.broadcastStatus();
      
      // Reset reconnect attempts on successful spawn
      this.reconnectAttempts = 0;
    });

    // Error event
    this.bot.on('error', (err) => {
      this.log(`An error occurred: ${err}`, 'error');
    });

    // End event (disconnected)
    this.bot.on('end', () => {
      this.log('Bot has disconnected from the server.', 'system');
      this.status.connected = false;
      this.status.server = false;
      this.status.activity = 'Disconnected';
      this.broadcastStatus();
      
      // Try to reconnect
      this.attemptReconnect();
    });

    // Kicked event
    this.bot.on('kicked', (reason) => {
      this.log(`Bot was kicked from the server: ${reason}`, 'error');
      this.status.connected = false;
      this.status.server = false;
      this.status.activity = 'Kicked';
      this.broadcastStatus();
      
      // Try to reconnect
      this.attemptReconnect();
    });
  }

  // Attempt to reconnect to the server
  private attemptReconnect(): void {
    // Skip reconnect if manual disconnect was requested
    if (this.manualDisconnect) {
      this.log('Manual disconnect detected - not attempting reconnection.', 'system');
      this.manualDisconnect = false; // Reset for future use
      return;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    this.reconnectAttempts++;
    this.lastReconnectTime = new Date();
    this.status.reconnectAttempts = this.reconnectAttempts;
    this.status.lastReconnectTime = this.formatTime(this.lastReconnectTime);
    
    this.log(`Reconnection attempt #${this.reconnectAttempts}`, 'warning');
    this.broadcastStatus();
    
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      this.reconnectInterval = setTimeout(() => {
        this.log('Attempting to reconnect...', 'system');
        this.start();
      }, this.reconnectDelay);
    } else {
      this.log(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`, 'error');
    }
  }

  // Format time in HH:MM:SS format
  private formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }

  // Format time difference as "Xh Ym Zs" or "X minutes ago"
  private formatTimeDifference(date: Date | null): string {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec} seconds ago`;
    } else if (diffSec < 3600) {
      return `${Math.floor(diffSec / 60)} minutes ago`;
    } else {
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      return `${hours}h ${minutes}m ${seconds}s ago`;
    }
  }

  // Calculate and update the uptime
  private updateStatusLive(): void {
    // Update uptime if bot is connected
    if (this.startTime && this.status.connected) {
      const now = new Date();
      const diffMs = now.getTime() - this.startTime.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      this.status.uptime = `${hours}h ${minutes}m ${seconds}s`;
    }
    
    // Update last restart time
    if (this.lastRestartTime) {
      this.status.lastRestart = this.formatTimeDifference(this.lastRestartTime);
    }
    
    // Update server address
    if (this.bot) {
      this.status.serverAddress = `${this.config.host}:${this.config.port}`;
    }
  }

  // Log a message and broadcast it to clients
  private log(message: string, type: string = 'info'): void {
    console.log(`[Bot2] ${message}`);
    
    // Broadcast to all connected clients
    this.broadcast({
      type: 'console',
      message,
      messageType: type
    });
  }

  // Broadcast a message to all connected clients
  private broadcast(data: any): void {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Broadcast current status to all clients
  private broadcastStatus(): void {
    this.updateStatusLive();
    
    // First notify clients to refresh status
    this.broadcast({
      type: 'statusUpdate'
    });
    
    // Then broadcast an event for the status change
    this.broadcast({
      type: 'event',
      event: {
        id: Date.now().toString(),
        title: this.getEventTitle(),
        description: this.getEventDescription(),
        timestamp: this.formatTime(new Date())
      }
    });
  }

  // Get a title for the current event based on status
  private getEventTitle(): string {
    if (!this.status.connected && this.reconnectAttempts > 0) {
      return 'Reconnection attempt';
    } else if (this.status.connected && this.status.activity === 'Active') {
      return 'Bot connected';
    } else if (!this.status.connected) {
      return 'Bot disconnected';
    } else {
      return 'Status update';
    }
  }

  // Get a description for the current event based on status
  private getEventDescription(): string {
    if (!this.status.connected && this.reconnectAttempts > 0) {
      return `Attempting to reconnect (try #${this.reconnectAttempts})`;
    } else if (this.status.connected && this.status.activity === 'Active') {
      return `Connected to ${this.status.serverAddress}`;
    } else if (!this.status.connected) {
      return 'Disconnected from server';
    } else {
      return `Status: ${this.status.activity}`;
    }
  }
}

// Create and export a singleton instance
export const minecraft2Bot = new Minecraft2Bot();