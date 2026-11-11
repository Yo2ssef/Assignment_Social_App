import z from 'zod';
import { generalValidationFields } from '../../common/utils';
import { languageEnum, LogoutEnum } from '../../common/enum';
const { email, password, userName, phone, dateOfBirth, gender, otp, jwt } = generalValidationFields;

const login = (lang: languageEnum) => {
    return z.strictObject({
        email: email(lang),
        password: password(lang),
    })
}
export const loginSchema = (lang: languageEnum) => {
    return z.object({
        body: login(lang)
    })
}
export const signupOrLoginWithGoogleSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            idToken: z.string({ error: lang == languageEnum.EN ? "Invalid idToken." : "رمز تعريف غير صالح." })
        })
    })
}
export const signupSchema = (lang: languageEnum) => {
    return z.object({
        body: login(lang).extend({
            userName: userName(lang),
            confirmPassword: password(lang),
            phone: phone(lang).optional(),
            dateOfBirth: dateOfBirth(lang).optional(),
            gender: gender(lang).optional(),
        }).refine((data) => {
            return data.password == data.confirmPassword
        }, {
            error: lang == languageEnum.EN ?
                "Password and confirmPassword not equal." :
                "كلمة المرور و تأكيد كلمة المرور غير متطابقين."
        })
    })
}
export const resendConfirmEmailSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            email: email(lang)
        })
    })
}
export const confirmEmailSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            email: email(lang),
            otp: otp(lang),
        })
    })
}
export const resetPasswordSchema = (lang: languageEnum) => {
    return z.object({
        body: login(lang).extend({
            otp: otp(lang),
            confirmPassword: password(lang)
        }).refine((data) => {
            return data.password == data.confirmPassword
        }, {
            error: lang == languageEnum.EN ?
                "Password and confirmPassword not equal." :
                "كلمة المرور و تأكيد كلمة المرور غير متطابقين."
        })
    })
}
export const logoutSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            action: z.enum(LogoutEnum, {
                error: lang == languageEnum.EN ?
                    "Invalid action." :
                    "إجراء غير صالح."
            })
        }).default({ action: LogoutEnum.ONE })
    })
}
export const tokenSchema = (lang: languageEnum) => {
    return z.object({
        token: jwt(lang)
    })
}