import { DatabaseRepository } from './base.repository';
import { IFollow, } from '../interface';
import { FollowModel } from '../../database/model';
export class FollowRepository extends DatabaseRepository<IFollow> {
    constructor() { super(FollowModel) }
}