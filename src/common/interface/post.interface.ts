import { UserIdTypeObject } from '../types';
import { IImage } from './index';
export interface IPost {
    createdBy: UserIdTypeObject;
    content?: string;
    attachments?: IImage[];
    createdAt?: string;
    updatedAt?: string;
}