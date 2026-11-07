import { NextFunction, Request, Response, Router } from 'express';
import { authentication, uploadMiddleware, validation } from '../../middleware';
import { ResponseFormatter } from '../../middleware';
import { allUsersSchema, getUserSchema, suggestionsSchema, userDataSchemaToUpdate, userProfileImageSchema } from './user.validation';
import userService from './user.service'
import { fileValidation, localFileUpload } from '../../common/utils';
import { IFile } from '../../common/types';
const router = Router({ strict: true, caseSensitive: true });

router.patch("/profile-image",
    authentication(),
    uploadMiddleware({
        isRequired: true,
        multerMiddleware: localFileUpload({}).single("avatar"),
        validation: fileValidation.image,
        customPath: "user"
    }),
    validation(userProfileImageSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.uploadProfileImage(req.file as IFile, req.user)
        return { message: " Profile image uploaded successfully.", data }
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

router.get("/:id",
    validation(getUserSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.getUser(req.validated.params, req.user)
        return { data }
    })
)

router.patch("/follow/:id",
    validation(getUserSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const { message, followed } = await userService.follow(req.validated.params, req.user)
        return { status: 201, message, data: { followed } }
    })
)
export default router