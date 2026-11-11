import { z } from 'zod';
import { createPostSchema } from '../post.validation';
export type CreatePostDto = z.infer<ReturnType <typeof createPostSchema>>