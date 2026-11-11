import mongoose, { HydratedDocument } from 'mongoose';
import { IPost } from '../../common/interface';
import { imageConstants } from '../../common/utils';
const postSchema = new mongoose.Schema<IPost>(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            minLength: 2,
            maxLength: 50000,
            required: function (): boolean { return !this.attachments?.length; }
        },
        attachments: [imageConstants],
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        optimisticConcurrency: true,
        versionKey: "versionData",
        collection: "POST_DB"
    }
)
postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId"
})
export const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema)
export type HPost = HydratedDocument<IPost>