export interface ISipServer {
  _id: string;
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
}

export interface ICreateSipServerRequest {
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
}

export interface IUpdateSipServerRequest {
  id: string;
  domain: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
}