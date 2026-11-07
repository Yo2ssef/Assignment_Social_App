import { z } from 'zod';
import { GenderUserEnum, languageEnum } from '../enum';
import mongoose from 'mongoose';
import { fileValidation } from './multer/local.multer.js';

export const generalValidationFields = {
    email: (lang: languageEnum) => z.email({
        error: lang == languageEnum.EN ?
            "Invalid email address format. Example: name@example.com" :
            "صيغة البريد الإلكتروني غير صحيحة. مثال: name@example.com"
    }).regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),

    password: (lang: languageEnum) => z.string({
        error: lang == languageEnum.EN ?
            "Must be 8–20 characters, contain at least one uppercase letter, and include a special character (@$#!&*%)." :
            "يجب أن تكون من 8 إلى 20 خانة، تحتوي على حرف كبير واحد على الأقل، ورمز خاص (@$#!&*%)."
    }).regex(/^(?=.*[A-Z])(?=.*[@$#!&*%])[a-zA-Z0-9@$#!&*%]{8,20}$/),

    userName: (lang: languageEnum) => z.string({
        error: lang == languageEnum.EN ?
            "Must consist of two words only, separated by a space, with the first letter capitalized." :
            "يجب أن يتكون الاسم من كلمتين فقط و يجب أن يكونا مفصولة بمسافة و اول حرف كبير."
    }).regex(/^[A-Z][a-zA-Z]*\s[a-zA-Z]+$/).min(3).max(20),

    phone: (lang: languageEnum) => z.e164({
        error: lang == languageEnum.EN ?
            "Phone number must be in E.164 format (e.g., +201234567890)." :
            "يجب أن يكون رقم الهاتف في صيغة E.164 (مثلاً: +201234567890)."
    }),

    dateOfBirth: (lang: languageEnum) => z.coerce.date({
        error: lang == languageEnum.EN ?
            "Date of birth must be in YYYY-MM-DD format (e.g., 2000-05-15)." :
            "يجب أن يكون تاريخ الميلاد بصيغة YYYY-MM-DD (مثال: 2000-05-15)."
    }),

    gender: (lang: languageEnum) => z.enum(GenderUserEnum, {
        error: lang == languageEnum.EN ?
            "Invalid gender selection." :
            "اختيار الجنس غير صحيح."
    }),

    jwt: (lang: languageEnum) => z.jwt({
        error: lang == languageEnum.EN ?
            "Invalid JWT token format." :
            "صيغة رمز JWT غير صحيحة."
    }),

    otp: (lang: languageEnum) => z.string({
        error: lang == languageEnum.EN ?
            "OTP must be a 6-digit numeric code." :
            "يجب أن يكون رمز التحقق OTP عبارة عن 6 أرقام."
    }).length(6).regex(/^\d+$/),

    id: (lang: languageEnum) => z.string().refine((data) => mongoose.Types.ObjectId.isValid(data), {
        error: lang == languageEnum.EN ?
            "Invalid ID format" :
            "صيغة المعرف غير صحيحة.",
    }),

    file: ({ lang, fieldname }: { lang: languageEnum, fieldname: string }) => z.strictObject({
        fieldname: z.literal(fieldname, {
            error: lang == languageEnum.EN ?
                `Field name must be '${fieldname}'.` :
                `اسم الحقل يجب أن يكون '${fieldname}'.`
        }),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(fileValidation.image),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string()
    }, {
        error: lang == languageEnum.EN ?
            "Invalid file object structure." :
            "هيكل كائن الملف غير صحيح."
    }),

    content: (lang: languageEnum) => z.string({
        error: lang == languageEnum.EN ?
            "Content must be between 2 and 50000 characters." :
            "يجب أن يكون المحتوى بين 2 و 50000 حرف."
    }).min(2).max(50000).optional(),
}