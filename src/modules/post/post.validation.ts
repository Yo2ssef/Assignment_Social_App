import z from 'zod';
import { generalValidationFields } from '../../common/utils/validation'
import { languageEnum } from '../../common/enum';
const { content, file, id } = generalValidationFields;
export const createPostSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            content: content(lang).optional(),
        }),
        files: z.array(file({ lang, fieldname: "attachment" })).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Message content or file attachment is required."
            })
        }
    })
}
export const getPostsUserSchema = (lang: languageEnum) => {
    return z.object({
        query: z.strictObject({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(5)
        })
    })
}
export const getPostSchema = (lang: languageEnum) => {
    return z.object({
        params: z.strictObject({
            id: id(lang)
        })
    })
}
export const updatePostSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            content: content(lang).optional(),
        }),
        files: z.array(file({ lang, fieldname: "attachment" })).max(3).optional(),
        params: z.strictObject({
            id: id(lang)
        })
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Message content or file attachment is required."
            })
        }
    })
}