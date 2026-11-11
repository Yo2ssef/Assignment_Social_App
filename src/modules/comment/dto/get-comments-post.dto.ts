import { z } from 'zod';
import { getCommentsPostSchema } from '../comment.validation';
export type GetCommentsPostDto = z.infer<ReturnType <typeof getCommentsPostSchema>>