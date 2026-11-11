"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionsSchema = exports.coverImageSchema = exports.userProfileImageSchema = exports.allUsersSchema = exports.getUserSchema = exports.userDataSchemaToUpdate = exports.tokenSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const utils_1 = require("../../common/utils");
const { userName, phone, dateOfBirth, gender, jwt, id, file } = utils_1.generalValidationFields;
const tokenSchema = (lang) => {
    return zod_1.default.object({
        token: jwt(lang)
    });
};
exports.tokenSchema = tokenSchema;
const userDataSchemaToUpdate = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            userName: userName(lang).optional(),
            phone: phone(lang).optional(),
            dateOfBirth: dateOfBirth(lang).optional(),
            gender: gender(lang).optional()
        })
    });
};
exports.userDataSchemaToUpdate = userDataSchemaToUpdate;
const getUserSchema = (lang) => {
    return zod_1.default.object({
        params: zod_1.default.strictObject({
            id: id(lang)
        })
    });
};
exports.getUserSchema = getUserSchema;
const allUsersSchema = (lang) => {
    return zod_1.default.object({
        query: zod_1.default.strictObject({
            userName: zod_1.default.string().min(3).max(20).regex(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/).optional(),
            page: zod_1.default.coerce.number().default(1),
            limit: zod_1.default.coerce.number().default(5)
        })
    });
};
exports.allUsersSchema = allUsersSchema;
const userProfileImageSchema = (lang) => {
    return zod_1.default.object({
        file: file({ lang, fieldname: "avatar" }).optional()
    });
};
exports.userProfileImageSchema = userProfileImageSchema;
const coverImageSchema = (lang) => {
    return zod_1.default.object({
        files: zod_1.default.array(file({ lang, fieldname: "attachment" })).max(2).optional()
    });
};
exports.coverImageSchema = coverImageSchema;
const suggestionsSchema = (lang) => {
    return zod_1.default.object({
        query: zod_1.default.strictObject({
            limit: zod_1.default.coerce.number().default(5).optional()
        })
    });
};
exports.suggestionsSchema = suggestionsSchema;
