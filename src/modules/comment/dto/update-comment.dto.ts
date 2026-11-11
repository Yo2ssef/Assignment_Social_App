import { z } from 'zod';
import { updateCommentSchema } from '../comment.validation';
export type UpdateCommentDto = z.infer<ReturnType <typeof updateCommentSchema>>