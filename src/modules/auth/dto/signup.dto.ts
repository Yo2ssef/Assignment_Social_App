import { z } from 'zod';
import { signupSchema } from '../auth.validation';
export type SignupDto = z.infer<ReturnType<typeof signupSchema>>