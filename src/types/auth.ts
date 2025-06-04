export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
} 