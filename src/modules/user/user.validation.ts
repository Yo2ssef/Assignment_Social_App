import z from 'zod';
import { generalValidationFields } from '../../common/utils';
import { languageEnum } from '../../common/enum';
const { userName, phone, dateOfBirth, gender, jwt, id, file } = generalValidationFields;
export const tokenSchema = (lang: languageEnum) => {
    return z.object({
        token: jwt(lang)
    })
}
export const userDataSchemaToUpdate = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            userName: userName(lang).optional(),
            phone: phone(lang).optional(),
            dateOfBirth: dateOfBirth(lang).optional(),
            gender: gender(lang).optional()
        })
    })
}
export const getUserSchema = (lang: languageEnum) => {
    return z.object({
        params: z.strictObject({
            id: id(lang)
        })
    })
}
export const allUsersSchema = (lang: languageEnum) => {
    return z.object({
        query: z.strictObject({
            userName: z.string().min(3).max(20).regex(/^[a-zA-Z]+(?: [a-zA-Z]+)?$/).optional(),
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(5)
        })
    })
}
export const userProfileImageSchema = (lang: languageEnum) => {
    return z.object({
        file: file({ lang, fieldname: "avatar" }).optional()
    })
}
export const coverImageSchema = (lang: languageEnum) => {
    return z.object({
        files: z.array(file({ lang, fieldname: "attachment" })).max(2).optional()
    })
}
export const suggestionsSchema = (lang: languageEnum) => {
    return z.object({
        query: z.strictObject({
            limit: z.coerce.number().default(5).optional()
        })
    })
}