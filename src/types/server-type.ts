interface ServerConfig {
  id: string;
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
  createdAt: string;
  updatedAt: string;
}

export type { ServerConfig }; 