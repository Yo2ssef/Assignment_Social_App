import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ResponseFormatter, validation, authentication } from '../../middleware';
import authService from './auth.service';
import { confirmEmailSchema, loginSchema, logoutSchema, resendConfirmEmailSchema, resetPasswordSchema, signupSchema } from './auth.validation';
import { issuerLink } from '../../common/utils';
import { TokenTypeEnum } from '../../common/enum';

const router = Router({ strict: true, caseSensitive: true });

router.post("/signup",
    validation(signupSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await authService.signUp(req.validated.body)
        return { status: 201, message: "Successfully signed up. Please confirm your email.", data }
    })
)

router.post("/signup-login-with-gmail",
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const issuer = issuerLink(req.protocol, req.host)
        const { status, data } = await authService.signUpOrLoginWithGoogle(req.body, issuer)
        return { status, message: "Successfully logged in.", data }
    })
)

router.post("/resend-confirm-email",
    validation(resendConfirmEmailSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        await authService.resendConfirmEmail(req.validated.body)
        return { message: "Successfully sent email confirmation code." }
    })
)

router.post("/confirm-email",
    validation(confirmEmailSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await authService.confirmEmail(req.validated.body)
        return { message: "Email confirmed successfully.", data }
    })
)

router.post("/request-forgot-password",
    validation(resendConfirmEmailSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        await authService.requestPasswordResetCode(req.validated.body)
        return { message: "Successfully sent forgot password code." }
    })
)

router.post("/verify-forgot-password",
    validation(confirmEmailSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        await authService.verifyPasswordResetCode(req.validated.body)
        return { message: "Successfully verified forgot password code." }
    })
)

router.post("/reset-forgot-password",
    validation(resetPasswordSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        await authService.resetPassword(req.validated.body)
        return { status: 201, message: "Successfully reset password." }
    })
)

router.post("/login",
    validation(loginSchema),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const issuer = issuerLink(req.protocol, req.host)
        const data = await authService.login(req.validated.body, issuer)
        return { message: "Successfully logged in.", data }
    })
)

router.post("/rotate-token",
    authentication(TokenTypeEnum.REFRESH),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const issuer = issuerLink(req.protocol, req.host)
        const data = await authService.rotateToken(req.user, req.payload, issuer)
        return { message: "Successfully logged in.", data }
    })
)

router.post("/rotate-token",
    validation(logoutSchema),
    authentication(),
    ResponseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const { message } = await authService.logout(req.user, req.payload, req.validated.body)
        return { message }
    })
)

export default router