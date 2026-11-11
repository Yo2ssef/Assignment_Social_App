"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const enum_1 = require("../common/enum");
const auth_validation_1 = require("../modules/auth/auth.validation");
const exception_1 = require("../common/exception");
const service_1 = require("../common/service");
const authentication = (tokenType = enum_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const lang = Number(req.headers["accept-language"] ?? enum_1.languageEnum.EN);
        const token = req.headers["authorization"];
        const validateData = (0, auth_validation_1.tokenSchema)(lang).safeParse({ token });
        if (!validateData.success) {
            throw new exception_1.BadRequestException("Validation Error.", validateData.error.issues);
        }
        const { token: validatedToken } = validateData.data;
        const { user, payload } = await service_1.tokenService.decodeToken({ token: validatedToken, tokenType });
        req.user = user;
        req.payload = payload;
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, _res, next) => {
        if (req.user.role === undefined || req.user.role < accessRole) {
            throw new exception_1.ForbiddenException("You are not authorized to access this resource.");
        }
        next();
    };
};
exports.authorization = authorization;
