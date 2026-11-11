"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const comment_service_1 = __importDefault(require("./comment.service"));
const utils_1 = require("../../common/utils");
const enum_1 = require("../../common/enum");
const comment_validation_1 = require("./comment.validation");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/:id", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, utils_1.localFileUpload)({
        storageApproach: enum_1.StorageApproachEnum.DISK
    }).single("attachment"),
    validation: utils_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(comment_validation_1.createCommentSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.createComment(req.user, {
        params: req.validated.params,
        body: req.validated.body,
        file: req.validated.file
    });
    return { status: 201, message: "Comment created successfully.", data: { data, files: req.validated.files } };
}));
router.get("/all", (0, middleware_1.authentication)(), (0, middleware_1.validation)(comment_validation_1.getCommentsPostSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.getCommentsPost(req.validated.query);
    return { data };
}));
router.patch("/:id", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, utils_1.localFileUpload)({
        storageApproach: enum_1.StorageApproachEnum.DISK
    }).single("attachment"),
    validation: utils_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(comment_validation_1.updateCommentSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.updateComment(req.user, {
        params: req.validated.params,
        body: req.validated.body,
        file: req.validated.file
    });
    return { message: "Comment updated successfully", data: { data, files: req.validated.files } };
}));
router.delete("/:id", (0, middleware_1.authentication)(), (0, middleware_1.validation)(comment_validation_1.getCommentSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.deleteComment(req.user, req.validated.params);
    return { message: "Comment deleted successfully", data };
}));
router.get("/:id", (0, middleware_1.authentication)(), (0, middleware_1.validation)(comment_validation_1.getCommentSchema), (0, middleware_1.ResponseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.getComment(req.validated.params);
    return { data };
}));
exports.default = router;
