import z from 'zod';
import { loginSchema } from '../auth.validation.js';
export type LoginDto = z.infer<ReturnType<typeof loginSchema>>