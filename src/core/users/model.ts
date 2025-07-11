export interface ICreateUserRequest {
  name: string;
  email: string;
  password: string | undefined;
  role: string;
  sipUsername: string | undefined;
  sipPassword: string | undefined;
  sipServerId: string | undefined;
  smsGatewayId: string | undefined;
}

export interface IUpdateUserRequest {
  id: string;
  name: string;
  email: string;
  password: string | undefined;
  role: string;
  sipUsername: string | undefined;
  sipPassword: string | undefined;
  sipServerId: string | undefined;
  smsGatewayId: string | undefined;
}