"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../../common/utils");
const postSchema = new mongoose_1.default.Schema({
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function () { return !this.attachments?.length; }
    },
    attachments: [utils_1.imageConstants],
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
    versionKey: "versionData",
    collection: "POST_DB"
});
postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId"
});
exports.PostModel = mongoose_1.default.models.Post || mongoose_1.default.model("Post", postSchema);
