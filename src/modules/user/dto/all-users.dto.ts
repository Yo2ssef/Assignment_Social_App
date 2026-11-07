import z from 'zod';
import { allUsersSchema } from '../user.validation';
export type AllUsersDto = z.infer<ReturnType<typeof allUsersSchema>> 