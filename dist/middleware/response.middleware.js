"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
const ResponseFormatter = (handler) => {
    return async (req, res, next) => {
        if (res.headersSent)
            return;
        const { status = 200, message = "Success.", data } = await handler(req, res, next);
        return res.status(status).json({
            status,
            message,
            data
        });
    };
};
exports.ResponseFormatter = ResponseFormatter;
