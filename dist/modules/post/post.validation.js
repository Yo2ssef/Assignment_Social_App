"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.getPostSchema = exports.getPostsUserSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_1 = require("../../common/utils/validation");
const { content, file, id } = validation_1.generalValidationFields;
const createPostSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            content: content(lang).optional(),
        }),
        files: zod_1.default.array(file({ lang, fieldname: "attachment" })).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Message content or file attachment is required."
            });
        }
    });
};
exports.createPostSchema = createPostSchema;
const getPostsUserSchema = (lang) => {
    return zod_1.default.object({
        query: zod_1.default.strictObject({
            page: zod_1.default.coerce.number().default(1),
            limit: zod_1.default.coerce.number().default(5)
        })
    });
};
exports.getPostsUserSchema = getPostsUserSchema;
const getPostSchema = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            id: id(lang)
        })
    });
};
exports.getPostSchema = getPostSchema;
const updatePostSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            content: content(lang).optional(),
        }),
        files: zod_1.default.array(file({ lang, fieldname: "attachment" })).max(3).optional(),
        params: zod_1.default.strictObject({
            id: id(lang)
        })
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Message content or file attachment is required."
            });
        }
    });
};
exports.updatePostSchema = updatePostSchema;
