import WebSocket from 'ws';

let wsClient: WebSocket | null = null;

function connectToWebSocket() {
  if (!wsClient || wsClient.readyState === WebSocket.CLOSED) {
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME || 'localhost';
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '8080';
    
    const wsUrl = process.env.NODE_ENV === "production"
      ? `wss://${hostname}/ws`
      : `ws://${hostname}:${wsPort}`;
      
    wsClient = new WebSocket(wsUrl);

    wsClient.on('open', () => {
      console.log('Backend connected to WebSocket server');
    });

    wsClient.on('error', (error) => {
      console.error('Backend WebSocket error:', error);
    });

    wsClient.on('close', () => {
      console.log('Backend WebSocket connection closed');
      wsClient = null;
      // Try to reconnect after 5 seconds
      setTimeout(connectToWebSocket, 5000);
    });
  }
  return wsClient;
}

export function sendToSocket(userId: string, type: string, data: any) {
  const ws = connectToWebSocket();
  
  const message = {
    type: 'backend_message',
    targetUserId: userId,
    messageType: type,
    data
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    ws.once('open', () => {
      ws.send(JSON.stringify(message));
    });
  }
} 