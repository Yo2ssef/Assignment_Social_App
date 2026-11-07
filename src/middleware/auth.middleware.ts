import { NextFunction, Request, Response } from 'express';
import { languageEnum, RoleUserEnum, TokenTypeEnum } from '../common/enum';
import { tokenSchema } from '../modules/auth/auth.validation';
import { BadRequestException, ForbiddenException } from '../common/exception';
import { tokenService } from '../common/service';

export const authentication = (tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const lang = Number(req.headers["accept-language"] ?? languageEnum.EN)
        const token = req.headers["authorization"]
        const validateData = tokenSchema(lang).safeParse({ token })

        if (!validateData.success) throw new BadRequestException("Validation Error.", validateData.error.issues)
        const { token: validatedToken } = validateData.data

        const { user, payload } = await tokenService.decodeToken({ token: validatedToken, tokenType })
        req.user = user
        req.payload = payload
        next()
    }
}

export const authorization = (accessRole: RoleUserEnum) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (req.user.role === undefined || req.user.role < accessRole) {
            throw new ForbiddenException("You are not authorized to access this resource.")
        }
        next()
    }
}