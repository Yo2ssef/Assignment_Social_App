"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
const exception_1 = require("../../common/exception");
const utils_1 = require("../../common/utils");
const commentSchema = new mongoose_1.default.Schema({
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function () { return !this.attachment; }
    },
    attachment: utils_1.imageConstants,
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
    versionKey: "versionData",
    collection: "COMMENT_DB"
});
commentSchema.pre('save', async function () {
    const postExists = await index_1.PostModel.exists({ _id: this.postId });
    console.log(postExists);
    if (!postExists) {
        throw new exception_1.BadRequestException('Post not found.');
    }
});
exports.CommentModel = mongoose_1.default.models.Comment || mongoose_1.default.model("Comment", commentSchema);
