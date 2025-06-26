import WebSocket from 'ws';

let wsClient: WebSocket | null = null;
let messageQueue: string[] = [];
let isConnecting = false;

function connectToWebSocket() {
  if (wsClient && (wsClient.readyState === WebSocket.OPEN || wsClient.readyState === WebSocket.CONNECTING)) {
    return;
  }

  isConnecting = true;

  const hostname = process.env.NEXT_PUBLIC_HOSTNAME || 'localhost';
  const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '8080';
  
  const wsUrl = process.env.NODE_ENV === "production"
    ? `wss://${hostname}/ws`
    : `ws://${hostname}:${wsPort}`;
    
  wsClient = new WebSocket(wsUrl);

  wsClient.on('open', () => {
    console.log('Backend connected to WebSocket server');
    isConnecting = false;
    while (messageQueue.length > 0) {
      wsClient?.send(messageQueue.shift()!);
    }
  });

  wsClient.on('error', (err: any) => {
    console.error('Backend WebSocket error:', err);
    if (wsClient?.readyState !== WebSocket.OPEN) {
      wsClient = null;
      isConnecting = false;
    }
  });

  wsClient.on('close', () => {
    console.log('Backend WebSocket connection closed');
    wsClient = null;
    isConnecting = false;
    setTimeout(connectToWebSocket, 5000);
  });

  return wsClient;
}

export function sendToSocket(userId: string, type: string, data: any) {
  const message = JSON.stringify({
    type: 'backend_message',
    targetUserId: userId,
    messageType: type,
    data
  });

  connectToWebSocket();

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(message);
  } else {
    messageQueue.push(message);
  }
} 