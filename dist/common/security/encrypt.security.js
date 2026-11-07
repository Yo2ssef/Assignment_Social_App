"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_js_1 = require("../../config/config.js");
const encrypt = async (plainText) => {
    if (!plainText)
        return undefined;
    const iv = node_crypto_1.default.randomBytes(config_js_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", config_js_1.ENC_KEY, iv);
    let cipherText = cipher.update(plainText, "utf-8", "hex").toString();
    cipherText += cipher.final("hex");
    return `${iv.toString("hex")}::${cipherText}`;
};
exports.encrypt = encrypt;
const decrypt = async (cipherText) => {
    if (!cipherText)
        return undefined;
    const [iv, encryptedText] = cipherText.split("::");
    const binaryIv = Buffer.from(iv, "hex");
    const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", config_js_1.ENC_KEY, binaryIv);
    let plainText = decipher.update(encryptedText, "hex", "utf8");
    plainText += decipher.final("utf-8");
    return plainText;
};
exports.decrypt = decrypt;
