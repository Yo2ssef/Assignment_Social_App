"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = exports.PostRepository = void 0;
const base_repository_1 = require("./base.repository");
const model_1 = require("../../database/model");
class PostRepository extends base_repository_1.DatabaseRepository {
    constructor() { super(model_1.PostModel); }
}
exports.PostRepository = PostRepository;
exports.postRepository = new PostRepository();
