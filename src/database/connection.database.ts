import mongoose from 'mongoose';
import { Application } from 'express';
import { DB_URI } from '../config/config';
import { UserModel } from './model';
import { FollowModel } from './model/follow.model.js';
export const bootStrap = async (app: Application, port: number) => {
    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 })
        console.log(`Database connected successfully....`);
        await UserModel.syncIndexes()
        await FollowModel.syncIndexes()
        app.listen(port, () => console.log(`Server is running http://localhost:${port}....`))
    } catch (error) {
        console.log(`Fail to connect on database.... Error::${error}`);
        process.exit(1)
    }
}