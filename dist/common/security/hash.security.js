"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.hash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hash = async (plainText, rounds = 12, minor = "b") => {
    if (!plainText)
        return undefined;
    if (typeof plainText == "number")
        plainText = String(plainText);
    const salt = (await bcrypt_1.default.genSalt(rounds, minor)).toString();
    const hashText = await bcrypt_1.default.hash(plainText, salt);
    return hashText;
};
exports.hash = hash;
const compareHash = async (plainText, hashValue) => {
    if (!plainText || !hashValue)
        return undefined;
    const result = await bcrypt_1.default.compare(plainText, hashValue);
    return result;
};
exports.compareHash = compareHash;
