import { WebSocketServer, WebSocket } from 'ws';

interface WebSocketMessage {
  type: string;
  userId?: string;
  targetUserId?: string;
  messageType?: string;
  data?: any;
  [key: string]: any;
}

const DEFAULT_PORT = 8080;

// Create a singleton instance
let wssInstance: WebSocketServer | null = null;

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
  console.log("++++++++++++++++ Send Message")
  const client = getClient(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    console.log("++++++++++++++++ Send Message To User")
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

function handleMessage(ws: WebSocket, message: string) {
  console.log("++++++++++++++++ Handle Message")
  try {
    const data = JSON.parse(message.toString()) as WebSocketMessage;
    
    if (data.type === 'auth' && data.userId) {
      addClient(data.userId, ws);
      console.log(`Client authenticated: ${data.userId}`);
    } else if (data.type === 'backend_message' && data.targetUserId) {
      // Handle messages from backend
      sendToUser(data.targetUserId, data.messageType!, data.data);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

export function startWebSocketServer(port: number = DEFAULT_PORT) {
  if (wssInstance) {
    return wssInstance;
  }

  try {
    wssInstance = new WebSocketServer({ port, path: process.env.NODE_ENV === 'production' ? '/ws' : undefined });
    console.log(`WebSocket server is running on port ${port}`);

    wssInstance.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message: string) => {
        handleMessage(ws, message);
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

    return wssInstance;
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
    throw error;
  }
}

// Export the instance getter
export function getWebSocketServer() {
  return wssInstance;
} 