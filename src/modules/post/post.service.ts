import { BadRequestException } from '../../common/exception';
import { IPaginate } from '../../common/interface';
import { postRepository, PostRepository } from '../../common/repository';
import { cloudService, CloudService } from '../../common/service';
import { FileType, UserIdTypeObject } from '../../common/types';
import { HPost, HUser } from '../../database/model';
import { CreatePostDto, GetPostsUserDto, UpdatePostDto } from './dto';
class PostService {
    private readonly postRepository: PostRepository;
    private readonly cloudService: CloudService;
    constructor() {
        this.postRepository = postRepository;
        this.cloudService = cloudService;
    }
    private selectsUser(): string {
        return "_id firstName lastName image coverImage isPrivate"
    }

    async createPost(user: HUser, { body: { content }, files }: CreatePostDto) {
        const postFiles = (files ?? []) as FileType[];

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

        return post
    }

    async getPostsUser(user: HUser, { page, limit }: GetPostsUserDto["query"]): Promise<IPaginate<HPost>> {
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
        })
        return posts
    }

    async getPost({ id }: { id: UserIdTypeObject }): Promise<HPost> {
        const post = await this.postRepository.findById({
            id,
            options: {
                populate: {
                    path: "createdBy",
                    select: this.selectsUser()
                }
            }
        })
        if (!post) throw new BadRequestException("Post not found.");
        return post
    }

    async updatePost(
        user: HUser,
        {
            body: { content },
            params: { id },
            files
        }: UpdatePostDto) {

        const post = await this.postRepository.findOne({
            filter: { _id: id, createdBy: user._id }
        });
        if (!post) {
            throw new BadRequestException("Post not found or you are not authorized to update this post.");
        }

        const postFiles = (files ?? []) as FileType[];
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
        return updatedPost
    }

    async deletePost(user: HUser, { id }: { id: UserIdTypeObject }): Promise<HPost> {
        const deletedPost = await this.postRepository.findOneAndDelete({
            filter: {
                _id: id,
                createdBy: user._id
            }
        })
        if (!deletedPost) {
            throw new BadRequestException("Post not found or you are not authorized to delete this post.");
        }
        if(deletedPost.attachments?.length){
            this.cloudService.deleteAssets(deletedPost.attachments)
        }
        return deletedPost
    }
}
export default new PostService()