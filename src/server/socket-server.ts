import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface WebSocketMessage {
  type: string;
  userId?: string;
  [key: string]: any;
}

const DEFAULT_PORT = 8080;
const INTERNAL_PORT = 8081;

(globalThis as any).globalClients = (globalThis as any).globalClients ?? new Map<string, WebSocket>();

export function addClient(userId: string, ws: WebSocket) {
  (globalThis as any).globalClients.set(userId, ws);
}   

export function removeClient(userId: string) {
  (globalThis as any).globalClients.delete(userId);
}

export function getClient(userId: string): WebSocket | undefined {
  return (globalThis as any).globalClients.get(userId);
}

export function isClientConnected(userId: string, ws: WebSocket): boolean {
  const client = (globalThis as any).globalClients.get(userId);
  return client === ws;
}

export function getConnectedClients() {
  return Array.from((globalThis as any).globalClients.keys());
}

export function sendToUser(userId: string, type: string, data: any) {
  const client = getClient(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type, ...data }));
  }
}

export function broadcastToAll(type: string, data: any) {
  (globalThis as any).globalClients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, ...data }));
    }
  });
}

function handleInternalMessage(message: string) {
  try {
    const data = JSON.parse(message);
    const { userId, type, payload } = data;
    
    if (userId) {
      sendToUser(userId, type, payload);
    } else {
      broadcastToAll(type, payload);
    }
  } catch (error) {
    console.error('Error handling internal message:', error);
  }
}

export function startWebSocketServer(port: number = DEFAULT_PORT) {
  try {
    const wss = new WebSocketServer({ port });
    console.log(`WebSocket server is running on port ${port}`);

    const internalWss = new WebSocketServer({ port: INTERNAL_PORT });
    console.log(`Internal WebSocket server is running on port ${INTERNAL_PORT}`);

    internalWss.on('connection', (ws) => {
      console.log('Next.js backend connected to internal WebSocket server');

      ws.on('message', (message: string) => {
        handleInternalMessage(message.toString());
      });

      ws.on('error', (error) => {
        console.error('Internal WebSocket error:', error);
      });
    });

    wss.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString()) as WebSocketMessage;
          
          if (data.type === 'auth' && data.userId) {
            addClient(data.userId, ws);
            console.log(`Client authenticated: ${data.userId}`);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      ws.on('close', () => {
        const connectedClients = getConnectedClients();
        for (const userId of connectedClients) {
          if (isClientConnected(userId as string, ws)) {
            removeClient(userId as string);
            console.log(`Client disconnected: ${userId}`);
            break;
          }
        }
      });
    });

    return wss;
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
    throw error;
  }
} 