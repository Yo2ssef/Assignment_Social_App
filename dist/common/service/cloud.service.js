"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const node_crypto_1 = require("node:crypto");
const exception_1 = require("../exception");
const config_1 = require("../../config/config");
class CloudService {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.AWS_REGION,
            credentials: {
                accessKeyId: config_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_1.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async uploadAsset({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, folder = "general", }) {
        const Key = `${config_1.APP_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: file.buffer
        });
        if (!command.input.Key) {
            throw new exception_1.BadRequestException("Fail to upload this asset.");
        }
        await this.client.send(command);
        return command.input.Key;
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
