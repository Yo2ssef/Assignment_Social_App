import { v2 as cloudinary } from 'cloudinary';
import { API_KEY, API_SECRET, APP_NAME, CLOUD_NAME } from '../../config';
import { FileType } from '../types';
import { unlink } from 'node:fs/promises';
import { IImage } from '../interface';
export class CloudService {
    private readonly client = cloudinary;
    constructor() {
        this.client.config({
            cloud_name: CLOUD_NAME,
            api_key: API_KEY,
            api_secret: API_SECRET
        });
    }
    async uploadAsset({
        file,
        nameFolder = "users"
    }: { file: FileType; nameFolder?: string }) {
        try {
            return await this.client.uploader.upload(file.path, {
                folder: `${APP_NAME}/${nameFolder}`
            });
        } finally {
            await unlink(file.path).catch(() => { });
        }
    }

    async uploadAssets({
        files,
        nameFolder = "users"
    }: { files: FileType[]; nameFolder?: string }) {
        return Promise.all(
            files.map(file => this.uploadAsset({ file, nameFolder }))
        )
    }

    async deleteAsset(idImage: string) {
        return await this.client.uploader.destroy(idImage)
    }

    async deleteAssets(images: IImage[]) {
        return this.client.api.delete_resources(images.map(image => image.idImage))
    }

    async uploadImage({ file, nameFolder = "users" }: {
        file: FileType;
        nameFolder?: string;
    }): Promise<IImage> {
        const uploadedFile = await this.uploadAsset({
            file,
            nameFolder
        });
        return {
            idImage: uploadedFile.public_id,
            urlImage: uploadedFile.secure_url
        };
    }

    async uploadImages({ files, nameFolder = "users" }: {
        files: FileType[];
        nameFolder?: string;
    }): Promise<IImage[]> {
        return Promise.all(
            files.map(file => this.uploadImage({ file, nameFolder }))
        );
    }
}
export const cloudService = new CloudService();