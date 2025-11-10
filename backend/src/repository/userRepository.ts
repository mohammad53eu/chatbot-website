import { User } from '../types/auth';

// In-memory user store (replace with real DB layer later)
const users = new Map<string, User>();

function uniqueConstraintViolated(user: User) {
  for (const existing of users.values()) {
    if (user.email && existing.email === user.email) return true;
    if (user.username && existing.username === user.username) return true;
  }
  return false;
}

export const userRepository = {
  create(user: User): User {
    if (uniqueConstraintViolated(user)) {
      throw new Error('UNIQUE_CONSTRAINT');
    }
    users.set(user.id, user);
    return user;
  },
  update(id: string, patch: Partial<User>): User | undefined {
    const current = users.get(id);
    if (!current) return undefined;
    const updated: User = { ...current, ...patch, updatedAt: new Date() };
    users.set(id, updated);
    return updated;
  },
  findById(id: string): User | undefined {
    return users.get(id);
  },
  findByEmail(email: string): User | undefined {
    email = email.toLowerCase();
    for (const u of users.values()) {
      if (u.email && u.email.toLowerCase() === email) return u;
    }
    return undefined;
  },
  findByUsername(username: string): User | undefined {
    for (const u of users.values()) {
      if (u.username === username) return u;
    }
    return undefined;
  },
  findByIdentifier(identifier: string): User | undefined {
    return this.findByEmail(identifier) || this.findByUsername(identifier);
  },
  all(): User[] {
    return [...users.values()];
  }
};
