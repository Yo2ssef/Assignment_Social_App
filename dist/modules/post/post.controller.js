"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const post_service_1 = __importDefault(require("./post.service"));
const post_validation_1 = require("./post.validation");
const utils_1 = require("../../common/utils");
const enum_1 = require("../../common/enum");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, utils_1.localFileUpload)({
        storageApproach: enum_1.StorageApproachEnum.DISK
    }).array("attachment", 3),
    validation: utils_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(post_validation_1.createPostSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.createPost(req.user, {
        body: req.validated.body,
        files: req.validated.files
    });
    return { status: 201, message: "Post created successfully", data };
}));
router.get("/all", (0, middleware_1.authentication)(), (0, middleware_1.validation)(post_validation_1.getPostsUserSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.getPostsUser(req.user, req.validated.query);
    return { data };
}));
router.patch("/:id", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, utils_1.localFileUpload)({
        storageApproach: enum_1.StorageApproachEnum.DISK
    }).array("attachment", 3),
    validation: utils_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(post_validation_1.updatePostSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.updatePost(req.user, {
        params: req.validated.params,
        body: req.validated.body,
        files: req.validated.files
    });
    return { message: "Post updated successfully", data, files: req.validated.files };
}));
router.delete("/:id", (0, middleware_1.authentication)(), (0, middleware_1.validation)(post_validation_1.getPostSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.deletePost(req.user, req.validated.params);
    return { message: "Post deleted successfully", data };
}));
router.get("/:id", (0, middleware_1.authentication)(), (0, middleware_1.validation)(post_validation_1.getPostSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.getPost(req.validated.params);
    return { data };
}));
exports.default = router;
