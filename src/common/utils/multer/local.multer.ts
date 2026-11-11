import multer from 'multer';
import { Request } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'node:crypto';
import {
    readFile,
    //  unlink 
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { BadRequestException } from '../../exception';
import { FileType } from '../../types';
import { StorageApproachEnum } from '../../enum';

export const fileValidation = {
    image: ["image/png", "image/jpeg", "image/gif"],
    files: ["application/pdf", "application/json"]
}

export const localFileUpload = ({
    maxFileSize = 2,
    storageApproach = StorageApproachEnum.MEMORY
}: { maxFileSize?: number, storageApproach?: StorageApproachEnum }) => {
    const storage = storageApproach == StorageApproachEnum.MEMORY ?
        multer.memoryStorage()
        : multer.diskStorage({
            destination(req, file, callback) {
                callback(null, tmpdir())
            },
            filename(req, file, callback) {
                callback(null, randomUUID() + file.originalname)
            },
        })
    return multer({
        storage,
        limits: { fileSize: maxFileSize * 1024 * 1024 }
    })

}

const processFile = async ({
    file,
    validation = []
}: { file: FileType, validation: string[] }) => {
    let buffer;
    if (file.path) buffer = await readFile(file.path);
    const result = await fileTypeFromBuffer(file.buffer || buffer as Buffer)
    if (!result || !validation.includes(result.mime)) {
        // if (file.path) unlink(file.path)
        throw new BadRequestException(`Invalid file type. Allowed types: ${validation.join(", ")}`)
    } else {
        // if (file.path) unlink(file.path);        
        return file
    }
}

const processFiles = async ({
    files = [],
    validation = []
}: { files: FileType[], validation: string[] }) => {
    const assets = []
    for (const file of files) {
        const uploadFile = await processFile({ file, validation })
        assets.push(uploadFile)
    }
    return assets
}

const processFields = async ({
    fields = {},
    validation = []
}: { customPath?: string, fields: Record<string, FileType[]>, validation: string[] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        const files = await processFiles({ files: fields[field] as FileType[], validation })
        assets.push({ field, files })
    }
    return assets
}

export const processMulterUpload = async ({
    req,
    validation = [] }: {
        req: Request,
        customPath?: string,
        validation: string[]
    }) => {
    if (req.file) {
        await processFile({ file: req.file, validation })
    } else if (Array.isArray(req.files)) {
        await processFiles({ files: req.files, validation })
    } else if (req.files !== null && typeof req.files == "object" && Object.keys(req.files)?.length) {
        await processFields({ fields: req.files, validation })
    }
}

