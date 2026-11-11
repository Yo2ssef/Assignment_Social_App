import { BadRequestException, ForbiddenException, NotFoundException } from '../../common/exception';
import { IPaginate } from '../../common/interface';
import { postRepository, PostRepository, CommentRepository, commentRepository } from '../../common/repository';
import { FileType, UserIdTypeObject } from '../../common/types';
import { HComment, HPost, HUser } from '../../database/model';
import { CreateCommentDto, GetCommentsPostDto, UpdateCommentDto } from './dto';
import { cloudService, CloudService } from '../../common/service';
class CommentService {
    private readonly commentRepository: CommentRepository;
    private readonly postRepository: PostRepository;
    private readonly cloudService: CloudService;
    constructor() {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.cloudService = cloudService;
    }
    private selectsUser(): string {
        return "_id firstName lastName image coverImage isPrivate"
    }

    async createComment(
        user: HUser,
        {
            params: { id },
            body: { content },
            file
        }: CreateCommentDto): Promise<HComment> {

        const attachment = file
            ? await this.cloudService.uploadImage({ file: file as FileType, nameFolder: "comments" })
            : undefined;

        const comment = await this.commentRepository.createOne({
            data: {
                postId: id,
                createdBy: user._id,
                content,
                attachment
            }
        })
        return comment
    }

    async getCommentsPost({ page, limit, id }: GetCommentsPostDto["query"]): Promise<IPaginate<HPost>> {
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
        })
        return comments
    }

    async getComment({ id }: { id: UserIdTypeObject }): Promise<HComment> {
        const comment = await this.commentRepository.findById({
            id,
            options: {
                populate: {
                    path: "createdBy",
                    select: this.selectsUser()
                }
            }
        })
        if (!comment) throw new BadRequestException("Comment not found.");
        return comment
    }

    async updateComment(
        user: HUser,
        {
            body: { content },
            params: { id },
            file
        }: UpdateCommentDto) {

        const comment = await this.commentRepository.findOne({
            filter: { _id: id, createdBy: user._id }
        });
        if (!comment) {
            throw new BadRequestException("Comment not found or you are not authorized to update this comment.");
        }

        const attachment = file
            ? await this.cloudService.uploadImage({ file: file as FileType, nameFolder: "comments" })
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
        return updatedComment
    }

    async deleteComment(user: HUser, { id }: { id: UserIdTypeObject }) {
        const comment = await this.commentRepository.findById({
            id,
            options: {
                populate: {
                    path: 'postId',
                    select: 'createdBy'
                }
            }
        })
        if (!comment) throw new NotFoundException("Comment not found.");
        const isCommentOwner = comment.createdBy.toString() === user._id.toString();
        const post = comment.postId as unknown as { _id: UserIdTypeObject; createdBy: UserIdTypeObject; };
        const isPostOwner = post.createdBy.toString() === user._id.toString();
        if (!isCommentOwner && !isPostOwner) {
            throw new ForbiddenException("You are not authorized to delete this comment");
        }

        const deletedComment = await this.commentRepository.findOneAndDelete({ filter: { _id: id } });
        if (deletedComment?.attachment) {
            await this.cloudService.deleteAsset(deletedComment?.attachment?.idImage)
        }
        return deletedComment
    }
}
export default new CommentService()