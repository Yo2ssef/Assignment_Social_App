"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = void 0;
const config_1 = require("../config/config");
const authErrors = ["jsonwebtokenerror", "tokenexpirederror"];
const validationErrors = ["validation", "sequelize"];
const globalErrorHandling = (error, req, res, next) => {
    const errorName = error?.name?.toLowerCase() ?? "";
    if (authErrors.some(err => errorName.includes(err)))
        error.status ??= 401;
    if (validationErrors.some(err => errorName.includes(err)))
        error.status ??= 400;
    const isProd = config_1.NODE_ENV === "production";
    const defaultMessage = "Something went wrong server error.";
    const status = error?.status ?? 500;
    const extra = error?.extra;
    const cause = error.cause;
    const messageExtra = extra ? extra[0]?.message : undefined;
    const messageCause = Array.isArray(cause) ? cause[0]?.message : undefined;
    const message = isProd && status === 500
        ? defaultMessage
        : (messageCause || messageExtra || error?.message || defaultMessage);
    return res.status(status).json({
        status,
        message,
        extra,
        cause: error.cause,
        error: isProd ? undefined : error,
        stack: isProd ? undefined : error?.stack
    });
};
exports.globalErrorHandling = globalErrorHandling;
