// import type { Request, Response } from 'express';
// import { register as svcRegister, login as svcLogin } from './service';
// import { registerSchema, loginSchema } from './validators';

// export async function register(req: Request, res: Response) {
  
//   const parsed = registerSchema.safeParse(req.body);
//   if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

//   try {
//     const result = await svcRegister(parsed.data);
//     return res.status(201).json(result);

//   } catch (error) {
//     return console.error(error);
//   }
// }

// export async function login(req: Request, res: Response) {
  
//   const parsed = loginSchema.safeParse(req.body);
//   if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

//   try {
//     const result = await svcLogin(parsed.data);
//     return res.json(result);

//   } catch (error) {
//     return console.error(error);
//   }
// }
