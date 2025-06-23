declare module '@apidaze/node' {
  export class Apidaze {
    constructor(apiKey: string, apiSecret: string);
    
    messages: {
      send(from: string, to: string, message: string): Promise<any>;
    };
  }
} 