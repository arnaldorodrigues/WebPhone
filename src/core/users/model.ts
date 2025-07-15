export interface ICreateUserRequest {
  name: string;
  email: string;
  password: string | undefined;
  role: string;
  sipUsername: string | undefined;
  sipPassword: string | undefined;
  sipServer: string | undefined;
  smsGateway: string | undefined;
}

export interface IUpdateUserRequest {
  id: string;
  name: string;
  email: string;
  password: string | undefined;
  role: string;
  sipUsername: string | undefined;
  sipPassword: string | undefined;
  sipServer: string | undefined;
  smsGateway: string | undefined;
}

export interface IUserData {
  id: string;
  name: string;
  email: string;
  sipUsername: string;
  sipPassword: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
  domain: string;
  didNumber: string;
  smsType: string;
}