import { Request, Response, NextFunction } from 'express';
import { CustomHandler, IResponse } from '../common/interface';

export const ResponseFormatter = (handler: CustomHandler) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        if (res.headersSent) return;
        const {
            status = 200,
            message = "Success.",
            data
        } = await handler(req, res, next) as IResponse;
        return res.status(status).json({
            status,
            message,
            data
        });
    };
};