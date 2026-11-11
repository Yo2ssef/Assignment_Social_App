import { UserIdTypeObject } from '../types';
import { IImage } from './index';
export interface IComment {
    postId: UserIdTypeObject;
    createdBy: UserIdTypeObject;
    content?: string;
    attachment?: IImage;
    createdAt?: string;
    updatedAt?: string;
}