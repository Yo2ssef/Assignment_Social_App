import { JwtPayload } from 'jsonwebtoken';
export type JwtPayloadType = JwtPayload & {
    sub?: string;
    aud?: number[];
    jti?: string;
    iat: number;
}