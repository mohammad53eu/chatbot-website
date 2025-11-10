import { randomUUID } from 'node:crypto';
import { userRepository } from '../repository/userRepository';
import { hashPassword, verifyPassword } from './password';
import { LoginInput, RegisterInput, User } from '../types/auth';
import { signAuthToken } from '../utils/jwt';

export async function register(input: RegisterInput): Promise<{ user: User; token: string }>{
  const now = new Date();
  const user: User = {
    id: randomUUID(),
    provider: 'local',
    email: input.identifierType === 'email' ? input.identifier.toLowerCase() : undefined,
    username: input.identifierType === 'username' ? input.identifier : undefined,
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };
  userRepository.create(user);
  const token = signAuthToken({ sub: user.id, provider: user.provider });
  return { user: publicUser(user), token };
}

export async function login(input: LoginInput): Promise<{ user: User; token: string }>{
  const user = userRepository.findByIdentifier(input.identifier);
  if (!user || !user.passwordHash) {
    const e: any = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    const e: any = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const token = signAuthToken({ sub: user.id, provider: user.provider });
  return { user: publicUser(user), token };
}

export function publicUser(u: User): User {
  // return a view without passwordHash
  const { passwordHash, ...rest } = u as any;
  return rest as User;
}
