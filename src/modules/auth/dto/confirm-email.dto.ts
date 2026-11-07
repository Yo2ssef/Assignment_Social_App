import z from 'zod';
import { confirmEmailSchema } from '../auth.validation';
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmailSchema>>