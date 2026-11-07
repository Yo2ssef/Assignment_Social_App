import mongoose from 'mongoose';
import { IFollow } from '../../common/interface';
import { HydratedDocument } from 'mongoose';

const followSchema = new mongoose.Schema(
    {
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        following: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        collection: "FOLLOW_DB",
        versionKey: false
    }
)

followSchema.index(
    { follower: 1, following: 1 },
    { unique: true }
)

export const FollowModel = mongoose.models.Follow || mongoose.model<IFollow>("Follow", followSchema)
export type HFollow = HydratedDocument<IFollow>