
import { NextFunction, Request, Response } from 'express';
import { IError } from '../common/interface';
import { NODE_ENV } from '../config';
const authErrors = ["jsonwebtokenerror", "tokenexpirederror"];
const validationErrors = ["validation", "sequelize"];
export const globalErrorHandling = (
    error: IError,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    const errorName = error?.name?.toLowerCase() ?? "";
    const cause = error?.cause;
    const extra = error?.extra;
    const causeStatus = (cause as { status?: number } | undefined)?.status;
    const httpCode = (error as { http_code?: number } | undefined)?.http_code;
    const getErrorStatus = (): number => {
        if (error?.status) return error.status;
        if (causeStatus) return causeStatus;
        if (httpCode) return httpCode;
        if (authErrors.some(err => errorName.includes(err))) return 401;
        if (validationErrors.some(err => errorName.includes(err))) return 400;
        return 500;
    };
    const status = getErrorStatus();
    const isProd = NODE_ENV === "production";
    const defaultMessage = "Something went wrong server error.";
    const messageExtra = extra?.[0]?.message;
    const messageCause = Array.isArray(cause)
        ? cause[0]?.message
        : undefined;
    const message = isProd && status >= 500
        ? defaultMessage
        : messageCause || messageExtra || error?.message || defaultMessage;
    return res.status(status).json({
        status,
        message,
        extra,
        cause,
        error: isProd ? undefined : error,
        stack: isProd ? undefined : error?.stack
    });
};
