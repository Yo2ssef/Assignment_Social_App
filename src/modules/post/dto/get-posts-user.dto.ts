import { z } from 'zod';
import { getPostsUserSchema } from '../post.validation';
export type GetPostsUserDto = z.infer<ReturnType <typeof getPostsUserSchema>>