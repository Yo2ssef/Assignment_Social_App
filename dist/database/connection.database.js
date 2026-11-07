"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootStrap = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const model_1 = require("./model");
const follow_model_js_1 = require("./model/follow.model.js");
const bootStrap = async (app, port) => {
    try {
        await mongoose_1.default.connect(config_1.DB_URI, { serverSelectionTimeoutMS: 30000 });
        console.log(`Database connected successfully....`);
        await model_1.UserModel.syncIndexes();
        await follow_model_js_1.FollowModel.syncIndexes();
        app.listen(port, () => console.log(`Server is running http://localhost:${port}....`));
    }
    catch (error) {
        console.log(`Fail to connect on database.... Error::${error}`);
        process.exit(1);
    }
};
exports.bootStrap = bootStrap;
