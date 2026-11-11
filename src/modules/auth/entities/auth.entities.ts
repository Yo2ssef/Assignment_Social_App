import { HUser } from "../../../database/model";
export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
}
export interface ISignupOrLoginWithGoogleResponse {
    status: number;
    message: string;
    data: ILoginResponse;
}
export interface ILogoutResponse {
    user: HUser,
    message: string
}