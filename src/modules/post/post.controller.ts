import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { authentication, ResponseFormatter, validation, uploadMiddleware } from '../../middleware';
import postService from './post.service';
import { createPostSchema, getPostSchema, getPostsUserSchema, updatePostSchema } from './post.validation';
import { fileValidation, localFileUpload } from '../../common/utils';
import { StorageApproachEnum } from '../../common/enum';

const router = Router({ strict: true, caseSensitive: true });

router.post("/",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload({
            storageApproach: StorageApproachEnum.DISK
        }).array("attachment", 3),
        validation: fileValidation.image,
        isRequired: false
    }),
    validation(createPostSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.createPost(
            req.user,
            {
                body: req.validated.body,
                files: req.validated.files
            }
        )
        return { status: 201, message: "Post created successfully", data }
    })
)

router.get("/all",
    authentication(),
    validation(getPostsUserSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.getPostsUser(req.user, req.validated.query)
        return { data }
    })
)

router.patch("/:id",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload({
            storageApproach: StorageApproachEnum.DISK
        }).array("attachment", 3),
        validation: fileValidation.image,
        isRequired: false
    }),
    validation(updatePostSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.updatePost(
            req.user,
            {
                params: req.validated.params,
                body: req.validated.body,
                files: req.validated.files
            })
        return { message: "Post updated successfully", data, files: req.validated.files }
    })
)

router.delete("/:id",
    authentication(),
    validation(getPostSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.deletePost(req.user, req.validated.params)
        return { message: "Post deleted successfully", data }
    })
)

router.get("/:id",
    authentication(),
    validation(getPostSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.getPost(req.validated.params)
        return { data }
    })
)

export default router