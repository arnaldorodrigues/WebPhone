import WebSocket from 'ws';

let internalWs: WebSocket | null = null;

function ensureConnection() {
  if (!internalWs || internalWs.readyState !== WebSocket.OPEN) {
    internalWs = new WebSocket('ws://localhost:8081');
    
    internalWs.on('error', (error) => {
      console.error('Internal WebSocket connection error:', error);
    });

    internalWs.on('close', () => {
      console.log('Internal WebSocket connection closed');
      internalWs = null;
    });
  }

  return internalWs;
}

export function sendInternalMessage(userId: string, type: string, payload: any) {
  const ws = ensureConnection();
  
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ userId, type, payload }));
  } else {
    ws.once('open', () => {
      ws.send(JSON.stringify({ userId, type, payload }));
    });
  }
} 