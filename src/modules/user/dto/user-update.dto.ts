import z from 'zod';
import { userDataSchemaToUpdate } from '../user.validation';
export type UpdateDto = z.infer<ReturnType<typeof userDataSchemaToUpdate>>