import { GenderUserEnum, ProviderUserEnum, RoleUserEnum } from '../enum';
import { IImage } from './index';
export interface IUser {
    userName?: string;
    firstName: string;
    lastName?: string;
    email: string;
    password: string | undefined;
    gender?: GenderUserEnum;
    role?: RoleUserEnum;
    provider?: ProviderUserEnum;
    phone?: string;
    dateOfBirth?: string;
    image?: IImage;
    coverImage?: IImage[];
    confirmEmail?: Date;
    changeCredentialsTime?: Date;
    createdAt?: string;
    updatedAt?: string;
    isPrivate?: boolean;
}