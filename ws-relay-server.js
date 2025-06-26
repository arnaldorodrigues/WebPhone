import http from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('✅ WebSocket client connected');

  ws.on('close', () => {
    clients = clients.filter((c) => c !== ws);
    console.log('❌ WebSocket client disconnected');
  });
});

app.post('/broadcast', (req, res) => {
  const message = req.body;

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.json({ status: 'sent' });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket relay running at http://localhost:${PORT}`);
});