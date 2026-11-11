"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.getCommentSchema = exports.getCommentsPostSchema = exports.createCommentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_1 = require("../../common/utils/validation");
const { content, file, id } = validation_1.generalValidationFields;
const createCommentSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            content: content(lang).optional(),
        }),
        file: file({ lang, fieldname: "attachment" }).optional(),
        params: zod_1.default.strictObject({
            id: id(lang)
        })
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.file) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "file"],
                message: "Comment content or file attachment is required."
            });
        }
    });
};
exports.createCommentSchema = createCommentSchema;
const getCommentsPostSchema = (lang) => {
    return zod_1.default.object({
        query: zod_1.default.strictObject({
            id: id(lang),
            page: zod_1.default.coerce.number().default(1),
            limit: zod_1.default.coerce.number().default(5)
        })
    });
};
exports.getCommentsPostSchema = getCommentsPostSchema;
const getCommentSchema = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            id: id(lang)
        })
    });
};
exports.getCommentSchema = getCommentSchema;
const updateCommentSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            content: content(lang).optional(),
        }),
        file: file({ lang, fieldname: "attachment" }).optional(),
        params: zod_1.default.strictObject({
            id: id(lang)
        })
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.file) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "file"],
                message: "Comment content or file attachment is required."
            });
        }
    });
};
exports.updateCommentSchema = updateCommentSchema;
