"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
class PostService {
    postRepository;
    cloudService;
    constructor() {
        this.postRepository = repository_1.postRepository;
        this.cloudService = service_1.cloudService;
    }
    selectsUser() {
        return "_id firstName lastName image coverImage isPrivate";
    }
    async createPost(user, { body: { content }, files }) {
        const postFiles = (files ?? []);
        const attachments = postFiles?.length
            ? await this.cloudService.uploadImages({ files: postFiles, nameFolder: "posts" })
            : [];
        const post = await this.postRepository.createOne({
            data: {
                createdBy: user._id,
                content,
                attachments
            }
        });
        return post;
    }
    async getPostsUser(user, { page, limit }) {
        const posts = await this.postRepository.paginate({
            filter: { createdBy: user._id },
            options: {
                populate: {
                    path: "createdBy",
                    select: this.selectsUser()
                }
            },
            select: "",
            limit,
            page
        });
        return posts;
    }
    async getPost({ id }) {
        const post = await this.postRepository.findById({
            id,
            options: {
                populate: {
                    path: "createdBy",
                    select: this.selectsUser()
                }
            }
        });
        if (!post)
            throw new exception_1.BadRequestException("Post not found.");
        return post;
    }
    async updatePost(user, { body: { content }, params: { id }, files }) {
        const post = await this.postRepository.findOne({
            filter: { _id: id, createdBy: user._id }
        });
        if (!post) {
            throw new exception_1.BadRequestException("Post not found or you are not authorized to update this post.");
        }
        const postFiles = (files ?? []);
        const attachments = postFiles.length
            ? await this.cloudService.uploadImages({ files: postFiles, nameFolder: "posts" })
            : undefined;
        const updatedPost = await this.postRepository.findOneAndUpdate({
            filter: { _id: id, createdBy: user._id },
            update: { content, attachments }
        });
        if (attachments && post.attachments?.length) {
            await this.cloudService.deleteAssets(post.attachments);
        }
        return updatedPost;
    }
    async deletePost(user, { id }) {
        const deletedPost = await this.postRepository.findOneAndDelete({
            filter: {
                _id: id,
                createdBy: user._id
            }
        });
        if (!deletedPost) {
            throw new exception_1.BadRequestException("Post not found or you are not authorized to delete this post.");
        }
        if (deletedPost.attachments?.length) {
            this.cloudService.deleteAssets(deletedPost.attachments);
        }
        return deletedPost;
    }
}
exports.default = new PostService();
