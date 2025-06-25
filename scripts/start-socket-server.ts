import { startWebSocketServer } from '../src/server/socket-server.js';

const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;
startWebSocketServer(port); 