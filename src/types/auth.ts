import { _IUser } from "@/models/User";

export interface IJwtPayload {
  userId: string;
  userName: string;
  email: string;
  role: string;
}

export interface ISignUpRequest {
  extensionNumber: string;
  password: string;
  name: string;
  email: string;
}

export interface ISignInRequest {
  email: string;
  password: string;
}
