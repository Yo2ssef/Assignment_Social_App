"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
class CommentService {
    commentRepository;
    postRepository;
    cloudService;
    constructor() {
        this.commentRepository = repository_1.commentRepository;
        this.postRepository = repository_1.postRepository;
        this.cloudService = service_1.cloudService;
    }
    selectsUser() {
        return "_id firstName lastName image coverImage isPrivate";
    }
    async createComment(user, { params: { id }, body: { content }, file }) {
        const attachment = file
            ? await this.cloudService.uploadImage({ file: file, nameFolder: "comments" })
            : undefined;
        const comment = await this.commentRepository.createOne({
            data: {
                postId: id,
                createdBy: user._id,
                content,
                attachment
            }
        });
        return comment;
    }
    async getCommentsPost({ page, limit, id }) {
        const comments = await this.postRepository.paginate({
            filter: { _id: id },
            options: {
                populate: [
                    {
                        path: "createdBy",
                        select: this.selectsUser()
                    },
                    {
                        path: "comments",
                        populate: {
                            path: "createdBy",
                            select: this.selectsUser()
                        }
                    }
                ]
            },
            select: "",
            limit,
            page
        });
        return comments;
    }
    async getComment({ id }) {
        const comment = await this.commentRepository.findById({
            id,
            options: {
                populate: {
                    path: "createdBy",
                    select: this.selectsUser()
                }
            }
        });
        if (!comment)
            throw new exception_1.BadRequestException("Comment not found.");
        return comment;
    }
    async updateComment(user, { body: { content }, params: { id }, file }) {
        const comment = await this.commentRepository.findOne({
            filter: { _id: id, createdBy: user._id }
        });
        if (!comment) {
            throw new exception_1.BadRequestException("Comment not found or you are not authorized to update this comment.");
        }
        const attachment = file
            ? await this.cloudService.uploadImage({ file: file, nameFolder: "comments" })
            : undefined;
        if (attachment && comment?.attachment?.idImage) {
            await this.cloudService.deleteAsset(comment.attachment?.idImage);
        }
        const updatedComment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: id, createdBy: user._id },
            update: {
                content,
                attachment
            }
        });
        return updatedComment;
    }
    async deleteComment(user, { id }) {
        const comment = await this.commentRepository.findById({
            id,
            options: {
                populate: {
                    path: 'postId',
                    select: 'createdBy'
                }
            }
        });
        if (!comment)
            throw new exception_1.NotFoundException("Comment not found.");
        const isCommentOwner = comment.createdBy.toString() === user._id.toString();
        const post = comment.postId;
        const isPostOwner = post.createdBy.toString() === user._id.toString();
        if (!isCommentOwner && !isPostOwner) {
            throw new exception_1.ForbiddenException("You are not authorized to delete this comment");
        }
        const deletedComment = await this.commentRepository.findOneAndDelete({ filter: { _id: id } });
        if (deletedComment?.attachment) {
            await this.cloudService.deleteAsset(deletedComment?.attachment?.idImage);
        }
        return deletedComment;
    }
}
exports.default = new CommentService();
