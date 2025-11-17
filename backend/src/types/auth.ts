export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatar_path: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string; // email or username
  password: string;
}

export interface AuthTokenPayload {
  sub: string; // user id
}

export interface SafeUser {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  createdAt: Date;
}
