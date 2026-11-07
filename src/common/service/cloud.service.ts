import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { BadRequestException } from '../exception';
import { APP_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY } from '../../config/config';
import { IFile } from '../types';
export class CloudService {
    private client: S3Client
    constructor() {
        this.client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        })
    }
    async uploadAsset({
        Bucket = AWS_BUCKET_NAME,
        ACL = ObjectCannedACL.private,
        file,
        folder = "general",
    }: {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        folder?: string,
        file: IFile,
    }): Promise<string> {
        const Key = `${APP_NAME}/${folder}/${randomUUID()}__${file.originalname}`
        const command = new PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: file.buffer
        })
        if (!command.input.Key) {
            throw new BadRequestException("Fail to upload this asset.")
        }
        await this.client.send(command)
        return command.input.Key

    }
}
export const cloudService = new CloudService()