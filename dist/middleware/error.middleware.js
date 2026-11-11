"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = void 0;
const config_1 = require("../config");
const authErrors = ["jsonwebtokenerror", "tokenexpirederror"];
const validationErrors = ["validation", "sequelize"];
const globalErrorHandling = (error, req, res, next) => {
    const errorName = error?.name?.toLowerCase() ?? "";
    const cause = error?.cause;
    const extra = error?.extra;
    const causeStatus = cause?.status;
    const httpCode = error?.http_code;
    const getErrorStatus = () => {
        if (error?.status)
            return error.status;
        if (causeStatus)
            return causeStatus;
        if (httpCode)
            return httpCode;
        if (authErrors.some(err => errorName.includes(err)))
            return 401;
        if (validationErrors.some(err => errorName.includes(err)))
            return 400;
        return 500;
    };
    const status = getErrorStatus();
    const isProd = config_1.NODE_ENV === "production";
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
exports.globalErrorHandling = globalErrorHandling;
