import crypto from 'node:crypto';
import { ENC_KEY, IV_LENGTH } from '../../config';
export const encrypt = async (plainText: string): Promise<string | undefined> => {
    if (!plainText) return undefined;
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv)
    let cipherText = cipher.update(plainText, "utf-8", "hex").toString()
    cipherText += cipher.final("hex")
    return `${iv.toString("hex")}::${cipherText}`
}
export const decrypt = async (cipherText: string): Promise<string | undefined> => {
    if (!cipherText) return undefined;
    const [iv, encryptedText] = cipherText.split("::") as [string | Buffer, string]
    const binaryIv = Buffer.from(iv as string, "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, binaryIv)
    let plainText = decipher.update(encryptedText, "hex", "utf8")
    plainText += decipher.final("utf-8")
    return plainText
}