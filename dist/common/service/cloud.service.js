"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../../config");
const promises_1 = require("node:fs/promises");
class CloudService {
    client = cloudinary_1.v2;
    constructor() {
        this.client.config({
            cloud_name: config_1.CLOUD_NAME,
            api_key: config_1.API_KEY,
            api_secret: config_1.API_SECRET
        });
    }
    async uploadAsset({ file, nameFolder = "users" }) {
        try {
            return await this.client.uploader.upload(file.path, {
                folder: `${config_1.APP_NAME}/${nameFolder}`
            });
        }
        finally {
            await (0, promises_1.unlink)(file.path).catch(() => { });
        }
    }
    async uploadAssets({ files, nameFolder = "users" }) {
        return Promise.all(files.map(file => this.uploadAsset({ file, nameFolder })));
    }
    async deleteAsset(idImage) {
        return await this.client.uploader.destroy(idImage);
    }
    async deleteAssets(images) {
        return this.client.api.delete_resources(images.map(image => image.idImage));
    }
    async uploadImage({ file, nameFolder = "users" }) {
        const uploadedFile = await this.uploadAsset({
            file,
            nameFolder
        });
        return {
            idImage: uploadedFile.public_id,
            urlImage: uploadedFile.secure_url
        };
    }
    async uploadImages({ files, nameFolder = "users" }) {
        return Promise.all(files.map(file => this.uploadImage({ file, nameFolder })));
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
