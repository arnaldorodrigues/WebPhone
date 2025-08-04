import { Connection } from 'modesl';

// Define interfaces for ESL responses
export interface ESLResponse {
  getBody: () => string;
}

// Define interface for Connection with api method
export interface ESLConnection extends Connection {
  // Override the api method to match how we're using it
  api(command: string, args: string[] | ((event: ESLResponse | null) => void), cb?: () => void): void;
}

// Define interfaces for database query results
export interface ExtensionRow {
  extension: string;
}