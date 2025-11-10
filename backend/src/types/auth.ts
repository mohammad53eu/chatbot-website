export type AuthProvider = 'local' | 'google';

export interface User {
  id: string;
  provider: AuthProvider;
  providerId?: string; // Google 'sub' value
  email?: string; // unique when present
  username?: string; // unique when present
  passwordHash?: string; // absent for google accounts
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  identifierType: 'email' | 'username';
  identifier: string; // email or username depending on identifierType
  password: string;
}

export interface LoginInput {
  identifier: string; // email or username
  password: string;
}

export interface AuthTokenPayload {
  sub: string; // user id
  provider: AuthProvider;
}
