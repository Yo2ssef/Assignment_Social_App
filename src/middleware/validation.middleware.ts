import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { languageEnum } from '../common/enum';
import { BadRequestException } from '../common/exception';
type ValidationInputType = (lang: languageEnum) => ZodType

export const validation = (schema: ValidationInputType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const lang = Number(req.headers["accept-language"] ?? languageEnum.EN)
        const validationData = schema(lang).safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
            file: req.file,
            files: req.files
        })
        if (!validationData.success) {
            throw new BadRequestException("Validation Error.", validationData.error.issues)
        }
        req.validated = validationData.data
        next()
    }
}