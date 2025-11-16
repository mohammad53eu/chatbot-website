export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  image?: Image;
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

interface Image {
  id: string;
  url: string;           // e.g., "/uploads/avatars/abc123.jpg" (relative path)
  filename: string;      // Original filename e.g., "profile.jpg"
  mimeType: string;      // e.g., "image/jpeg", "image/png"
  size: number;          // File size in bytes
  createdAt: Date;
}