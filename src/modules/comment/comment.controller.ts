import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { authentication, ResponseFormatter, validation, uploadMiddleware } from '../../middleware';
import commentService from './comment.service';
import { fileValidation, localFileUpload } from '../../common/utils';
import { StorageApproachEnum } from '../../common/enum';
import { createCommentSchema, getCommentSchema, getCommentsPostSchema, updateCommentSchema } from './comment.validation';

const router = Router({ strict: true, caseSensitive: true });

router.post("/:id",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload({
            storageApproach: StorageApproachEnum.DISK
        }).single("attachment"),
        validation: fileValidation.image,
        isRequired: false
    }),
    validation(createCommentSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.createComment(
            req.user,
            {
                params: req.validated.params,
                body: req.validated.body,
                file: req.validated.file
            }
        )
        return { status: 201, message: "Comment created successfully.", data: { data, files: req.validated.files } }
    })
)

router.get("/all",
    authentication(),
    validation(getCommentsPostSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.getCommentsPost(req.validated.query)
        return { data }
    })
)

router.patch("/:id",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload({
            storageApproach: StorageApproachEnum.DISK
        }).single("attachment"),
        validation: fileValidation.image,
        isRequired: false
    }),
    validation(updateCommentSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.updateComment(
            req.user,
            {
                params: req.validated.params,
                body: req.validated.body,
                file: req.validated.file
            })
        return { message: "Comment updated successfully", data: { data, files: req.validated.files } }
    })
)

router.delete("/:id",
    authentication(),
    validation(getCommentSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.deleteComment(req.user, req.validated.params)
        return { message: "Comment deleted successfully", data }
    })
)

router.get("/:id",
    authentication(),
    validation(getCommentSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.getComment(req.validated.params)
        return { data }
    })
)

export default router