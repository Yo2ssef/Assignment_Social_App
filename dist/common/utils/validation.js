"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
const enum_1 = require("../enum");
const mongoose_1 = __importDefault(require("mongoose"));
const local_multer_js_1 = require("./multer/local.multer.js");
exports.generalValidationFields = {
    email: (lang) => zod_1.z.email({
        error: lang == enum_1.languageEnum.EN ?
            "Invalid email address format. Example: name@example.com" :
            "صيغة البريد الإلكتروني غير صحيحة. مثال: name@example.com"
    }).regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    password: (lang) => zod_1.z.string({
        error: lang == enum_1.languageEnum.EN ?
            "Must be 8–20 characters, contain at least one uppercase letter, and include a special character (@$#!&*%)." :
            "يجب أن تكون من 8 إلى 20 خانة، تحتوي على حرف كبير واحد على الأقل، ورمز خاص (@$#!&*%)."
    }).regex(/^(?=.*[A-Z])(?=.*[@$#!&*%])[a-zA-Z0-9@$#!&*%]{8,20}$/),
    userName: (lang) => zod_1.z.string({
        error: lang == enum_1.languageEnum.EN ?
            "Must consist of two words only, separated by a space, with the first letter capitalized." :
            "يجب أن يتكون الاسم من كلمتين فقط و يجب أن يكونا مفصولة بمسافة و اول حرف كبير."
    }).regex(/^[A-Z][a-zA-Z]*\s[a-zA-Z]+$/).min(3).max(20),
    phone: (lang) => zod_1.z.e164({
        error: lang == enum_1.languageEnum.EN ?
            "Phone number must be in E.164 format (e.g., +201234567890)." :
            "يجب أن يكون رقم الهاتف في صيغة E.164 (مثلاً: +201234567890)."
    }),
    dateOfBirth: (lang) => zod_1.z.coerce.date({
        error: lang == enum_1.languageEnum.EN ?
            "Date of birth must be in YYYY-MM-DD format (e.g., 2000-05-15)." :
            "يجب أن يكون تاريخ الميلاد بصيغة YYYY-MM-DD (مثال: 2000-05-15)."
    }),
    gender: (lang) => zod_1.z.enum(enum_1.GenderUserEnum, {
        error: lang == enum_1.languageEnum.EN ?
            "Invalid gender selection." :
            "اختيار الجنس غير صحيح."
    }),
    jwt: (lang) => zod_1.z.jwt({
        error: lang == enum_1.languageEnum.EN ?
            "Invalid JWT token format." :
            "صيغة رمز JWT غير صحيحة."
    }),
    otp: (lang) => zod_1.z.string({
        error: lang == enum_1.languageEnum.EN ?
            "OTP must be a 6-digit numeric code." :
            "يجب أن يكون رمز التحقق OTP عبارة عن 6 أرقام."
    }).length(6).regex(/^\d+$/),
    id: (lang) => zod_1.z.string().refine((data) => mongoose_1.default.Types.ObjectId.isValid(data), {
        error: lang == enum_1.languageEnum.EN ?
            "Invalid ID format" :
            "صيغة المعرف غير صحيحة.",
    }),
    file: ({ lang, fieldname }) => zod_1.z.strictObject({
        fieldname: zod_1.z.literal(fieldname, {
            error: lang == enum_1.languageEnum.EN ?
                `Field name must be '${fieldname}'.` :
                `اسم الحقل يجب أن يكون '${fieldname}'.`
        }),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.enum(local_multer_js_1.fileValidation.image),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string()
    }, {
        error: lang == enum_1.languageEnum.EN ?
            "Invalid file object structure." :
            "هيكل كائن الملف غير صحيح."
    }),
    content: (lang) => zod_1.z.string({
        error: lang == enum_1.languageEnum.EN ?
            "Content must be between 2 and 50000 characters." :
            "يجب أن يكون المحتوى بين 2 و 50000 حرف."
    }).min(2).max(50000).optional(),
};
