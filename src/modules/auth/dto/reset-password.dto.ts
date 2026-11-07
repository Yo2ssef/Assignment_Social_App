import z from 'zod';
import { resetPasswordSchema } from '../auth.validation';
export type ResetPasswordDto =  z.infer<ReturnType<typeof resetPasswordSchema>>