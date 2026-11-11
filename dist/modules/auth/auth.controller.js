"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const utils_1 = require("../../common/utils");
const enum_1 = require("../../common/enum");
const auth_service_1 = __importDefault(require("./auth.service"));
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/signup", (0, middleware_1.validation)(auth_validation_1.signupSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await auth_service_1.default.signup(req.validated.body);
    return { status: 201, message: "Successfully signed up. Please confirm your email.", data };
}));
router.post("/signup-login-with-gmail", (0, middleware_1.validation)(auth_validation_1.signupOrLoginWithGoogleSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const issuer = (0, utils_1.issuerLink)(req.protocol, req.host);
    const { status, message, data } = await auth_service_1.default.signupOrLoginWithGoogle(req.body, issuer);
    return { status, message, data };
}));
router.post("/resend-confirm-email", (0, middleware_1.validation)(auth_validation_1.resendConfirmEmailSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    await auth_service_1.default.resendConfirmEmail(req.validated.body);
    return { message: "Successfully sent email confirmation code." };
}));
router.post("/confirm-email", (0, middleware_1.validation)(auth_validation_1.confirmEmailSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await auth_service_1.default.confirmEmail(req.validated.body);
    return { message: "Email confirmed successfully.", data };
}));
router.post("/request-forgot-password", (0, middleware_1.validation)(auth_validation_1.resendConfirmEmailSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    await auth_service_1.default.requestPasswordResetCode(req.validated.body);
    return { message: "Successfully sent forgot password code." };
}));
router.post("/verify-forgot-password", (0, middleware_1.validation)(auth_validation_1.confirmEmailSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    await auth_service_1.default.verifyPasswordResetCode(req.validated.body);
    return { message: "Successfully verified forgot password code." };
}));
router.post("/reset-forgot-password", (0, middleware_1.validation)(auth_validation_1.resetPasswordSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    await auth_service_1.default.resetPassword(req.validated.body);
    return { status: 201, message: "Successfully reset password." };
}));
router.post("/login", (0, middleware_1.validation)(auth_validation_1.loginSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const issuer = (0, utils_1.issuerLink)(req.protocol, req.host);
    const data = await auth_service_1.default.login(req.validated.body, issuer);
    return { message: "Successfully logged in.", data };
}));
router.post("/rotate-token", (0, middleware_1.authentication)(enum_1.TokenTypeEnum.REFRESH), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const issuer = (0, utils_1.issuerLink)(req.protocol, req.host);
    const data = await auth_service_1.default.rotateToken(req.user, req.payload, issuer);
    return { message: "Successfully logged in.", data };
}));
router.post("/logout", (0, middleware_1.validation)(auth_validation_1.logoutSchema), (0, middleware_1.authentication)(), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const { message } = await auth_service_1.default.logout(req.user, req.payload, req.validated.body);
    return { message };
}));
exports.default = router;
