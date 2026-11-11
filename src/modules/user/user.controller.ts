import { NextFunction, Request, Response, Router } from 'express';
import { authentication, uploadMiddleware, validation } from '../../middleware';
import { ResponseFormatter } from '../../middleware';
import { allUsersSchema, coverImageSchema, getUserSchema, suggestionsSchema, userDataSchemaToUpdate, userProfileImageSchema, } from './user.validation';
import userService from './user.service'
import { fileValidation, localFileUpload } from '../../common/utils';
import { StorageApproachEnum } from '../../common/enum';
const router = Router({ strict: true, caseSensitive: true });

router.patch("/profile-image",
    uploadMiddleware({
        isRequired: true,
        multerMiddleware: localFileUpload({
            storageApproach: StorageApproachEnum.DISK
        }).single("avatar"),
        validation: fileValidation.image,
    }),
    authentication(),
    validation(userProfileImageSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.uploadProfileImage(req.validated.file, req.user)
        return { message: "Profile image uploaded successfully.", data }
    })
)

router.patch("/upload-cover-image",
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({
            storageApproach: StorageApproachEnum.DISK
        }).array("attachment", 2),
        validation: fileValidation.image,
    }),
    authentication(),
    validation(coverImageSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.uploadCoverImage(req.validated.files, req.user)
        return { message: "Cover image uploaded successfully.", data }
    })
)

router.get("/",
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const user = await userService.profile(req.user)
        return { data: user }
    })
)

router.patch("/",
    validation(userDataSchemaToUpdate),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const user = await userService.update(req.validated.body, req.user)
        return { message: "User updated successfully.", data: user }
    })
)

router.get("/all",
    validation(allUsersSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const users = await userService.allUsers(req.validated.query, req.user)
        return { data: users }
    })
)

router.get("/suggestions",
    validation(suggestionsSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const users = await userService.suggestions(req.validated.query, req.user)
        return { data: users }
    })
)

router.patch("/follow/:id",
    validation(getUserSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const { status, message, followed } = await userService.follow(req.validated.params, req.user)
        return { status, message, data: { followed } }
    })
)

router.get("/:id",
    validation(getUserSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.getUser(req.validated.params, req.user)
        return { data }
    })
)

export default router