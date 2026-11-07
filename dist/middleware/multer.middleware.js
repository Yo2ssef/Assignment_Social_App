"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const exception_1 = require("../common/exception");
const utils_1 = require("../common/utils");
const hasUploadedFiles = (req) => {
    if (req.file)
        return true;
    if (Array.isArray(req.files))
        return req.files.length > 0;
    if (req.files !== null && req.files && typeof req.files === "object") {
        return Object.values(req.files).some((files) => Array.isArray(files) && files.length > 0);
    }
    return false;
};
const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation = [] }) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
                return;
            }
            try {
                if (isRequired && !hasUploadedFiles(req)) {
                    next(new exception_1.BadRequestException("File is required."));
                    return;
                }
                await (0, utils_1.processMulterUpload)({ req, customPath, validation });
                next();
            }
            catch (error) {
                next(error);
            }
        });
    };
};
exports.uploadMiddleware = uploadMiddleware;
