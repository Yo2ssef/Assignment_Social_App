import mongoose, { HydratedDocument } from 'mongoose';
import { IComment } from '../../common/interface';
import { PostModel } from './index';
import { BadRequestException } from '../../common/exception';
import { imageConstants } from '../../common/utils';
const commentSchema = new mongoose.Schema<IComment>(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            minLength: 2,
            maxLength: 50000,
            required: function (): boolean { return !this.attachment; }
        },
        attachment: imageConstants,
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        optimisticConcurrency: true,
        versionKey: "versionData",
        collection: "COMMENT_DB"
    }
)

commentSchema.pre('save', async function () {
    const postExists = await PostModel.exists({ _id: this.postId });
    console.log(postExists);

    if (!postExists) {
        throw new BadRequestException('Post not found.');
    }
});

export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema)
export type HComment = HydratedDocument<IComment>