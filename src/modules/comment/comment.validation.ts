import z from 'zod';
import { generalValidationFields } from '../../common/utils/validation'
import { languageEnum } from '../../common/enum';
const { content, file, id } = generalValidationFields;
export const createCommentSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            content: content(lang).optional(),
        }),
        file: file({ lang, fieldname: "attachment" }).optional(),

        params: z.strictObject({
            id: id(lang)
        })
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.file) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "file"],
                message: "Comment content or file attachment is required."
            })
        }
    })
}
export const getCommentsPostSchema = (lang: languageEnum) => {
    return z.object({
        query: z.strictObject({
            id: id(lang),
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(5)
        })
    })
}
export const getCommentSchema = (lang: languageEnum) => {
    return z.object({
        params: z.strictObject({
            id: id(lang)
        })
    })
}
export const updateCommentSchema = (lang: languageEnum) => {
    return z.object({
        body: z.strictObject({
            content: content(lang).optional(),
        }),
        file: file({ lang, fieldname: "attachment" }).optional(),
        params: z.strictObject({
            id: id(lang)
        })
    }).superRefine((data, ctx) => {
        if (!data.body?.content && !data.file) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "file"],
                message: "Comment content or file attachment is required."
            })
        }
    })
}