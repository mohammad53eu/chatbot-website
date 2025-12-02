export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
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
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  sub: string;
}

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  createdAt: Date;
}
