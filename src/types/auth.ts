export interface User {
  _id: string;
  extensionNumber: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface SignUpRequest {
  extensionNumber: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  extensionNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
} 