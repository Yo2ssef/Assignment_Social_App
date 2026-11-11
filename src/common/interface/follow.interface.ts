import { UserIdTypeObject } from '../types';
export interface IFollow {
    follower: UserIdTypeObject;
    following: UserIdTypeObject;
    createdAt?: string;
    updatedAt?: string;
}