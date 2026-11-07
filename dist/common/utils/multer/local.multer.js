"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMulterUpload = exports.localFileUpload = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const file_type_1 = require("file-type");
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const domain_exception_1 = require("../../exception/domain.exception");
const enum_1 = require("../../enum");
const node_os_1 = require("node:os");
exports.fileValidation = {
    image: ["image/png", "image/jpeg", "image/gif"],
    files: ["application/pdf", "application/json"]
};
const localFileUpload = ({ maxFileSize = 2, storageApproach = enum_1.StorageApproachEnum.MEMORY }) => {
    const storage = storageApproach == enum_1.StorageApproachEnum.MEMORY ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, (0, node_os_1.tmpdir)());
        },
        filename(req, file, callback) {
            callback(null, (0, node_crypto_1.randomUUID)() + file.originalname);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: maxFileSize * 1024 * 1024
        }
    });
};
exports.localFileUpload = localFileUpload;
const processFile = async ({ customPath = "general", file, validation = [] }) => {
    if (file.path) {
        file.buffer = await (0, promises_1.readFile)(file.path);
    }
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        await (0, promises_1.unlink)(file.path);
        throw new domain_exception_1.BadRequestException(`Invalid file type. Allowed types: ${validation.join(", ")}`);
    }
    else {
        if (file.path) {
            await (0, promises_1.unlink)(file.path);
        }
        return file;
    }
};
const processFiles = async ({ customPath = "general", files = [], validation = [] }) => {
    const assets = [];
    for (const file of files) {
        const uploadFile = await processFile({ customPath, file, validation });
        assets.push(uploadFile);
    }
    return assets;
};
const processFields = async ({ customPath = "general", fields = {}, validation = [] }) => {
    const assets = [];
    for (const field of Object.keys(fields)) {
        const files = await processFiles({ customPath, files: fields[field], validation });
        assets.push({ field, files });
    }
    return assets;
};
const processMulterUpload = async ({ req, customPath = "general", validation = [] }) => {
    if (req.file) {
        await processFile({ customPath, file: req.file, validation });
    }
    else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation });
    }
    else if (req.files !== null && typeof req.files == "object" && Object.keys(req.files)?.length) {
        await processFields({ customPath, fields: req.files, validation });
    }
};
exports.processMulterUpload = processMulterUpload;
