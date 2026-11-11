import { DatabaseRepository } from './base.repository';
import { IComment } from '../interface';
import { CommentModel } from '../../database/model';
export class CommentRepository extends DatabaseRepository<IComment> {
    constructor() { super(CommentModel) }
}
export const commentRepository = new CommentRepository()