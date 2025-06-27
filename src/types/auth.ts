import { User } from "@/models/User";

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
  user: Omit<User, "password">;
}