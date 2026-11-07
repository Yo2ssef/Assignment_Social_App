import mongoose from 'mongoose';
export const toObjectID = (id: string): mongoose.Types.ObjectId => {
    return mongoose.Types.ObjectId.createFromHexString(id)
}