"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const model_1 = require("./../../database/model");
class UserRepository extends base_repository_1.DatabaseRepository {
    constructor() { super(model_1.UserModel); }
}
exports.UserRepository = UserRepository;
