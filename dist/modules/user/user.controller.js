"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const middleware_2 = require("../../middleware");
const user_validation_1 = require("./user.validation");
const user_service_1 = __importDefault(require("./user.service"));
const utils_1 = require("../../common/utils");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.patch("/profile-image", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    isRequired: true,
    multerMiddleware: (0, utils_1.localFileUpload)({}).single("avatar"),
    validation: utils_1.fileValidation.image,
    customPath: "user"
}), (0, middleware_1.validation)(user_validation_1.userProfileImageSchema), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.uploadProfileImage(req.file, req.user);
    return { message: " Profile image uploaded successfully.", data };
}));
router.get("/", (0, middleware_1.authentication)(), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const user = await user_service_1.default.profile(req.user);
    return { data: user };
}));
router.patch("/", (0, middleware_1.validation)(user_validation_1.userDataSchemaToUpdate), (0, middleware_1.authentication)(), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const user = await user_service_1.default.update(req.validated.body, req.user);
    return { message: "User updated successfully.", data: user };
}));
router.get("/all", (0, middleware_1.validation)(user_validation_1.allUsersSchema), (0, middleware_1.authentication)(), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const users = await user_service_1.default.allUsers(req.validated.query, req.user);
    return { data: users };
}));
router.get("/suggestions", (0, middleware_1.validation)(user_validation_1.suggestionsSchema), (0, middleware_1.authentication)(), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const users = await user_service_1.default.suggestions(req.validated.query, req.user);
    return { data: users };
}));
router.get("/:id", (0, middleware_1.validation)(user_validation_1.getUserSchema), (0, middleware_1.authentication)(), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.getUser(req.validated.params, req.user);
    return { data };
}));
router.patch("/follow/:id", (0, middleware_1.validation)(user_validation_1.getUserSchema), (0, middleware_1.authentication)(), (0, middleware_2.ResponseFormatter)(async (req, res, next) => {
    const { message, followed } = await user_service_1.default.follow(req.validated.params, req.user);
    return { status: 201, message, data: { followed } };
}));
exports.default = router;
