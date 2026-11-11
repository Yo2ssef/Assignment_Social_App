import { z } from 'zod';
import { createCommentSchema } from '../comment.validation';
export type CreateCommentDto = z.infer<ReturnType <typeof createCommentSchema>>