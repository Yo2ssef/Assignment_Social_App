import { NextFunction, Request, RequestHandler, Response } from 'express';
import { BadRequestException } from '../common/exception';
import { processMulterUpload } from '../common/utils';
const hasUploadedFiles = (req: Request) => {
    if (req.file) return true
    if (Array.isArray(req.files)) return req.files.length > 0
    if (req.files !== null && req.files && typeof req.files === "object") {
        return Object.values(req.files).some(
            (files) => Array.isArray(files) && files.length > 0
        );
    }
    return false;
};

export const uploadMiddleware = ({
    isRequired = true,
    multerMiddleware,
    customPath = "general",
    validation = []
}: {
    isRequired?: boolean,
    multerMiddleware: RequestHandler,
    customPath?: string,
    validation: string[]
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        multerMiddleware(req, res, async (error?: any) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return;
            }
            try {
                if (isRequired && !hasUploadedFiles(req)) {
                    next(new BadRequestException("File is required."))
                    return;
                }
                await processMulterUpload({ req, customPath, validation })
                next()
            } catch (error: any) {
                next(error);
            }
        })
    }
}