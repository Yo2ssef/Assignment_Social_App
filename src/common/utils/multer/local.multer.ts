import multer from 'multer';
import { Request } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'node:crypto';
import {
    readFile,
    unlink,
    // mkdir,
    // writeFile
} from 'node:fs/promises';
// import { resolve } from 'node:path';
import { BadRequestException } from '../../exception/domain.exception';
import { IFile } from '../../types';
import { StorageApproachEnum } from '../../enum';
import { tmpdir } from 'node:os';

export const fileValidation = {
    image: ["image/png", "image/jpeg", "image/gif"],
    files: ["application/pdf", "application/json"]
}

export const localFileUpload = ({ maxFileSize = 2, storageApproach = StorageApproachEnum.MEMORY }: { maxFileSize?: number, storageApproach?: StorageApproachEnum }) => {
    const storage = storageApproach == StorageApproachEnum.MEMORY ? multer.memoryStorage() : multer.diskStorage({
        destination(req, file, callback) {
            callback(null, tmpdir())
        },
        filename(req, file, callback) {
            callback(null, randomUUID() + file.originalname)
        },
    })
    return multer({
        storage,
        limits: {
            fileSize: maxFileSize * 1024 * 1024
        }
    })

}

const processFile = async ({
    customPath = "general",
    file,
    validation = []
}: { customPath?: string, file: IFile, validation: string[] }) => {
    if (file.path) {
        file.buffer = await readFile(file.path)
    }
    const result = await fileTypeFromBuffer(file.buffer)
    if (!result || !validation.includes(result.mime)) {
        await unlink(file.path)
        throw new BadRequestException(`Invalid file type. Allowed types: ${validation.join(", ")}`)
    } else {
        // await mkdir(resolve(`./assets/${customPath}`), { recursive: true })
        // const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        // await writeFile(resolve(`./${uniqueFilePath}`), file.buffer)
        if (file.path) {
            await unlink(file.path)
        }
        // file.path = uniqueFilePath
        return file
    }
}

const processFiles = async ({
    customPath = "general",
    files = [],
    validation = []
}: { customPath?: string, files: IFile[], validation: string[] }) => {
    const assets = []
    for (const file of files) {
        const uploadFile = await processFile({ customPath, file, validation })
        assets.push(uploadFile)
    }
    return assets
}

const processFields = async ({
    customPath = "general",
    fields = {},
    validation = []
}: { customPath?: string, fields: Record<string, IFile[]>, validation: string[] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        const files = await processFiles({ customPath, files: fields[field] as IFile[], validation })
        assets.push({ field, files })
    }
    return assets
}

export const processMulterUpload = async ({
    req,
    customPath = "general",
    validation = [] }: {
        req: Request,
        customPath?: string,
        validation: string[]
    }) => {
    if (req.file) {
        await processFile({ customPath, file: req.file, validation })
    } else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation })
    } else if (req.files !== null && typeof req.files == "object" && Object.keys(req.files)?.length) {
        await processFields({ customPath, fields: req.files, validation })
    }
}

