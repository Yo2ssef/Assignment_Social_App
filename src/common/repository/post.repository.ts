import { DatabaseRepository } from './base.repository';
import { IPost } from '../interface';
import { PostModel } from '../../database/model';
export class PostRepository extends DatabaseRepository<IPost> {
    constructor() { super(PostModel) }
}
export const postRepository = new PostRepository()