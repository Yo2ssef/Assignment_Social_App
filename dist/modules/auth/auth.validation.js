"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenSchema = exports.logoutSchema = exports.resetPasswordSchema = exports.confirmEmailSchema = exports.resendConfirmEmailSchema = exports.signupSchema = exports.signupOrLoginWithGoogleSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const utils_1 = require("../../common/utils");
const enum_1 = require("../../common/enum");
const { email, password, userName, phone, dateOfBirth, gender, otp, jwt } = utils_1.generalValidationFields;
const login = (lang) => {
    return zod_1.default.strictObject({
        email: email(lang),
        password: password(lang),
    });
};
const loginSchema = (lang) => {
    return zod_1.default.object({
        body: login(lang)
    });
};
exports.loginSchema = loginSchema;
const signupOrLoginWithGoogleSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            idToken: zod_1.default.string({ error: lang == enum_1.languageEnum.EN ? "Invalid idToken." : "رمز تعريف غير صالح." })
        })
    });
};
exports.signupOrLoginWithGoogleSchema = signupOrLoginWithGoogleSchema;
const signupSchema = (lang) => {
    return zod_1.default.object({
        body: login(lang).extend({
            userName: userName(lang),
            confirmPassword: password(lang),
            phone: phone(lang).optional(),
            dateOfBirth: dateOfBirth(lang).optional(),
            gender: gender(lang).optional(),
        }).refine((data) => {
            return data.password == data.confirmPassword;
        }, {
            error: lang == enum_1.languageEnum.EN ?
                "Password and confirmPassword not equal." :
                "كلمة المرور و تأكيد كلمة المرور غير متطابقين."
        })
    });
};
exports.signupSchema = signupSchema;
const resendConfirmEmailSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            email: email(lang)
        })
    });
};
exports.resendConfirmEmailSchema = resendConfirmEmailSchema;
const confirmEmailSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            email: email(lang),
            otp: otp(lang),
        })
    });
};
exports.confirmEmailSchema = confirmEmailSchema;
const resetPasswordSchema = (lang) => {
    return zod_1.default.object({
        body: login(lang).extend({
            otp: otp(lang),
            confirmPassword: password(lang)
        }).refine((data) => {
            return data.password == data.confirmPassword;
        }, {
            error: lang == enum_1.languageEnum.EN ?
                "Password and confirmPassword not equal." :
                "كلمة المرور و تأكيد كلمة المرور غير متطابقين."
        })
    });
};
exports.resetPasswordSchema = resetPasswordSchema;
const logoutSchema = (lang) => {
    return zod_1.default.object({
        body: zod_1.default.strictObject({
            action: zod_1.default.enum(enum_1.LogoutEnum, {
                error: lang == enum_1.languageEnum.EN ?
                    "Invalid action." :
                    "إجراء غير صالح."
            })
        }).default({ action: enum_1.LogoutEnum.ONE })
    });
};
exports.logoutSchema = logoutSchema;
const tokenSchema = (lang) => {
    return zod_1.default.object({
        token: jwt(lang)
    });
};
exports.tokenSchema = tokenSchema;
