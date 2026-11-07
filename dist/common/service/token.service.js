"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = require("node:crypto");
const enum_1 = require("../enum");
const config_1 = require("../../config/config");
const exception_1 = require("../exception");
const repository_1 = require("./../repository");
const cache_service_1 = require("./cache.service");
const utils_1 = require("../utils");
class TokenService {
    userRepository;
    cacheService;
    constructor() {
        this.userRepository = new repository_1.UserRepository;
        this.cacheService = cache_service_1.cacheService;
    }
    userBaseRevokeTokenKey({ userId }) {
        return `User::${userId.toString()}::RevokeToken`;
    }
    userRevokeTokenKey({ userId, jti }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    getTokenSignatures({ role = enum_1.RoleUserEnum.USER }) {
        let signatures;
        switch (role) {
            case enum_1.RoleUserEnum.ADMIN:
                signatures = {
                    accessSignature: config_1.ADMIN_ACCESS_TOKEN_SIGNATURE,
                    refreshSignature: config_1.ADMIN_REFRESH_TOKEN_SIGNATURE
                };
                break;
            case enum_1.RoleUserEnum.USER:
                signatures = {
                    accessSignature: config_1.USER_ACCESS_TOKEN_SIGNATURE,
                    refreshSignature: config_1.USER_REFRESH_TOKEN_SIGNATURE
                };
                break;
            default:
                throw new exception_1.UnauthorizedException("Invalid token role.");
        }
        return signatures;
    }
    getTokenSignature({ tokenType = enum_1.TokenTypeEnum.ACCESS, role = enum_1.RoleUserEnum.USER }) {
        const { accessSignature, refreshSignature } = this.getTokenSignatures({ role });
        if (tokenType === enum_1.TokenTypeEnum.ACCESS)
            return accessSignature;
        if (tokenType === enum_1.TokenTypeEnum.REFRESH)
            return refreshSignature;
        throw new exception_1.BadRequestException("Invalid token type.");
    }
    async createToken({ payload, secret = config_1.USER_ACCESS_TOKEN_SIGNATURE, options }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token, secret = config_1.USER_ACCESS_TOKEN_SIGNATURE, options }) {
        return jsonwebtoken_1.default.verify(token, secret, options);
    }
    async createLoginCredentials({ user, issuer, options }) {
        const { accessSignature, refreshSignature } = this.getTokenSignatures({ role: user.role });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const accessToken = await this.createToken({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                ...options,
                audience: [user.role],
                jwtid,
                issuer,
                expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN
            }
        });
        const refreshToken = await this.createToken({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                ...options,
                audience: [user.role],
                issuer,
                jwtid,
                expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN
            }
        });
        return { accessToken, refreshToken };
    }
    async decodeToken({ token, tokenType = enum_1.TokenTypeEnum.ACCESS }) {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded?.aud || !Array.isArray(decoded.aud) || !decoded.aud.length)
            throw new exception_1.BadRequestException("Missing token.");
        const audience = decoded.aud[0];
        if (typeof audience !== 'number' && typeof audience !== 'string')
            throw new exception_1.BadRequestException("Missing token.");
        const payload = await this.verifyToken({
            token,
            secret: this.getTokenSignature({ tokenType, role: audience })
        });
        if (!payload?.sub || !payload?.jti || typeof payload.iat !== 'number')
            throw new exception_1.BadRequestException("Missing token.");
        if (await this.cacheService.exist({
            key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti })
        })) {
            throw new exception_1.UnauthorizedException("Token has been revoked, please login again.");
        }
        const user = await this.userRepository.findById({
            id: (0, utils_1.toObjectID)(payload.sub),
        });
        if (!user)
            throw new exception_1.NotFoundException("User not found.");
        if (user.changeCredentialsTime && user.changeCredentialsTime.getTime() > payload.iat * 1000) {
            throw new exception_1.UnauthorizedException("Token has been revoked, please login again.");
        }
        return { user, payload };
    }
    async createRevokeToken({ payload }) {
        if (!payload.sub || !payload.jti || typeof payload.iat !== 'number')
            throw new exception_1.BadRequestException("Missing token payload.");
        const now = Math.ceil(Date.now() / 1000);
        const sessionExpiresAt = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
        const ttl = sessionExpiresAt - now;
        const userId = payload.sub;
        const jti = payload.jti;
        await this.cacheService.set({
            key: this.userRevokeTokenKey({ userId, jti }),
            value: jti,
            ttl
        });
        return { message: "Token revoked successfully." };
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
