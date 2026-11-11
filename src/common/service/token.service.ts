import jwt, { PrivateKey, PublicKey, Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { RoleUserEnum, TokenTypeEnum } from '../enum';
import { ACCESS_TOKEN_EXPIRES_IN, ADMIN_ACCESS_TOKEN_SIGNATURE, ADMIN_REFRESH_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, USER_ACCESS_TOKEN_SIGNATURE, USER_REFRESH_TOKEN_SIGNATURE } from '../../config';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../exception';
import { userRepository, UserRepository } from './../repository';
import { cacheService, CacheService } from './index';
import { toObjectID } from '../utils';
import { HUser } from '../../database/model';
import { ILoginResponse } from '../../modules/auth/entities/auth.entities';
import { JwtPayloadType, UserIdType } from '../types';
import { ISigntures } from '../interface';

export class TokenService {
    private readonly userRepository: UserRepository;
    private readonly cacheService: CacheService;
    constructor() {
        this.userRepository = userRepository;
        this.cacheService = cacheService;
    }
    userBaseRevokeTokenKey({ userId }: { userId: UserIdType }): string {
        return `User::${userId.toString()}::RevokeToken`
    }
    userRevokeTokenKey({ userId, jti }: { userId: UserIdType, jti: string }): string {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`
    }
    private getTokenSignatures({ role = RoleUserEnum.USER }: { role: RoleUserEnum }): ISigntures {
        let signatures;
        switch (role) {
            case RoleUserEnum.ADMIN:
                signatures = {
                    accessSignature: ADMIN_ACCESS_TOKEN_SIGNATURE,
                    refreshSignature: ADMIN_REFRESH_TOKEN_SIGNATURE
                }
                break;
            case RoleUserEnum.USER:
                signatures = {
                    accessSignature: USER_ACCESS_TOKEN_SIGNATURE,
                    refreshSignature: USER_REFRESH_TOKEN_SIGNATURE
                }
                break;
            default:
                throw new UnauthorizedException("Invalid token role.")
        }
        return signatures
    }
    private getTokenSignature({
        tokenType = TokenTypeEnum.ACCESS,
        role = RoleUserEnum.USER
    }: {
        tokenType: TokenTypeEnum,
        role: RoleUserEnum
    }): string {
        const { accessSignature, refreshSignature } = this.getTokenSignatures({ role })
        if (tokenType === TokenTypeEnum.ACCESS) return accessSignature;
        if (tokenType === TokenTypeEnum.REFRESH) return refreshSignature;
        throw new BadRequestException("Invalid token type.")
    }
    private async createToken({
        payload,
        secret = USER_ACCESS_TOKEN_SIGNATURE,
        options
    }: {
        payload: string | Buffer | object,
        secret: Secret | PrivateKey,
        options?: SignOptions,
    }): Promise<string> {
        return jwt.sign(payload, secret, options)
    }
    private async verifyToken({
        token,
        secret = USER_ACCESS_TOKEN_SIGNATURE,
        options
    }: {
        token: string,
        secret: Secret | PublicKey,
        options?: VerifyOptions,
    }): Promise<JwtPayloadType> {
        return jwt.verify(token, secret, options) as JwtPayloadType
    }
    async createLoginCredentials({
        user,
        issuer,
        options
    }: {
        user: any,
        issuer: string,
        options?: SignOptions
    }): Promise<ILoginResponse> {
        const { accessSignature, refreshSignature } = this.getTokenSignatures({ role: user.role })
        const jwtid = randomUUID()
        const accessToken = await this.createToken({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                ...options,
                audience: [user.role],
                jwtid,
                issuer,
                expiresIn: ACCESS_TOKEN_EXPIRES_IN
            }
        })
        const refreshToken = await this.createToken({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                ...options,
                audience: [user.role],
                issuer,
                jwtid,
                expiresIn: REFRESH_TOKEN_EXPIRES_IN
            }
        })
        return { accessToken, refreshToken }
    }
    async decodeToken({
        token,
        tokenType = TokenTypeEnum.ACCESS
    }: {
        token: string,
        tokenType: TokenTypeEnum
    }): Promise<{ user: HUser, payload: JwtPayloadType }> {
        const decoded = jwt.decode(token) as JwtPayloadType | null
        if (!decoded?.aud || !Array.isArray(decoded.aud) || !decoded.aud.length) {
            throw new BadRequestException("Missing token.")
        }
        const audience = decoded.aud[0]
        if (typeof audience !== "number" && typeof audience !== "string") {
            throw new BadRequestException("Missing token.")
        }
        const payload = await this.verifyToken({
            token,
            secret: this.getTokenSignature({ tokenType, role: audience as unknown as RoleUserEnum })
        })
        if (!payload?.sub || !payload?.jti || typeof payload.iat !== "number") {
            throw new BadRequestException("Missing token.")
        }

        if (await this.cacheService.exist({
            key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti })
        })) {
            throw new UnauthorizedException("Token has been revoked, please login again.")
        }

        const user = await this.userRepository.findById({
            id: toObjectID(payload.sub),
        })
        if (!user) throw new NotFoundException("User not found.");

        if (user.changeCredentialsTime && user.changeCredentialsTime.getTime() > payload.iat * 1000) {
            throw new UnauthorizedException("Token has been revoked, please login again.")
        }
        return { user, payload }
    }
    async createRevokeToken({ payload }: { payload: JwtPayloadType }) {
        if (!payload.sub || !payload.jti || typeof payload.iat !== "number") {
            throw new BadRequestException("Missing token payload.")
        }
        const now = Math.ceil(Date.now() / 1000)
        const sessionExpiresAt = payload.iat + REFRESH_TOKEN_EXPIRES_IN
        const ttl = sessionExpiresAt - now
        const userId = payload.sub
        const jti = payload.jti
        await this.cacheService.set({
            key: this.userRevokeTokenKey({ userId, jti }),
            value: jti,
            ttl
        })
        return { message: "Token revoked successfully." }
    }
}
export const tokenService = new TokenService()