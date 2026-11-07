"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const enum_1 = require("../common/enum");
const exception_1 = require("../common/exception");
const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers["accept-language"] ?? enum_1.languageEnum.EN);
        const validationData = schema(lang).safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
            file: req.file,
            files: req.files
        });
        if (!validationData.success) {
            throw new exception_1.BadRequestException("Validation Error.", validationData.error.issues);
        }
        req.validated = validationData.data;
        next();
    };
};
exports.validation = validation;
