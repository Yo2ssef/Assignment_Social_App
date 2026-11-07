import { DatabaseRepository } from "./base.repository";
import { IUser } from "../interface";
import { UserModel } from './../../database/model';
export class UserRepository extends DatabaseRepository<IUser> {
    constructor() { super(UserModel) }
}