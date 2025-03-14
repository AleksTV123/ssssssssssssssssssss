import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { minecraftBot } from './bot';

export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Add this client to the bot's broadcast list
    minecraftBot.addClient(ws);

    // Handle client disconnection
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      minecraftBot.removeClient(ws);
    });

    // Handle client messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Process client commands if needed
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}
