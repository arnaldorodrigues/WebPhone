import { IUser } from "@/models/User";

export interface IJwtPayload {
  userId: string;
  userName: string;
  email: string;
  role: string;
}

export interface SignUpRequest {
  extensionNumber: string;
  password: string;
  name: string;
  email: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<IUser, "password">;
}