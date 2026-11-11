import { z } from 'zod';
import { updatePostSchema } from '../post.validation';
export type UpdatePostDto = z.infer<ReturnType <typeof updatePostSchema>>