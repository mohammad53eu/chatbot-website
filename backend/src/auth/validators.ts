import { z } from 'zod';

export const registerSchema = z.object({
  identifierType: z.enum(['email', 'username']),
  identifier: z.string().min(3),
  password: z.string().min(8)
}).superRefine((val, ctx) => {
  if (val.identifierType === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.identifier)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid email format', path: ['identifier'] });
    }
  } else {
    if (!/^[A-Za-z0-9_]+$/.test(val.identifier)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Username can contain alphanumeric and underscore only', path: ['identifier'] });
    }
  }
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1)
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
