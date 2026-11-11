import { RoleUserEnum } from '../../common/enum';
import { NotFoundException } from '../../common/exception';
import { followRepository, FollowRepository, userRepository, UserRepository } from '../../common/repository';
import { toObjectID } from '../../common/utils';
import { HUser } from '../../database/model';
import { AllUsersDto, UpdateDto } from './dto';
import { FileType } from '../../common/types';
import { IFollowResponse } from './entities/user.entities';
import { CloudService, cloudService } from '../../common/service';
export class UserService {
    private readonly userRepository: UserRepository;
    private readonly followRepository: FollowRepository;
    private cloudService: CloudService;
    constructor() {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.cloudService = cloudService;
    }
    private selectsUserList(): string {
        return "_id firstName lastName image coverImage isPrivate"
    }
    private selectsPublicProfile(): string {
        return "_id firstName lastName userName image coverImage gender isPrivate createdAt"
    }
    private selectsAdminUserList(): string {
        return "_id firstName lastName email gender role provider phone dateOfBirth coverImage isPrivate createdAt updatedAt confirmEmail userName"
    }
    private async getFollowersAndFollowing(user: HUser) {
        const followers = await this.followRepository.find({
            filter: { following: user._id },
            options: {
                populate: { path: "follower", select: this.selectsUserList() },
                lean: true
            },
            select: "following createdAt -_id"
        }) ?? []
        const following = await this.followRepository.find({
            filter: { follower: user._id },
            options: {
                populate: { path: "following", select: this.selectsUserList() },
                lean: true
            },
            select: "following createdAt -_id"
        }) ?? []
        return {
            followers: followers?.map(ele => ({ ...ele.follower, followAt: ele.createdAt })),
            following: following?.map(ele => ({ ...ele.following, followingAt: ele.createdAt }))
        }
    }

    async uploadProfileImage(file: FileType, user: HUser) {
        if (user.image?.idImage) {
            await this.cloudService.deleteAsset(user.image?.idImage);
        }
        const avatar = await this.cloudService.uploadImage({
            file,
            nameFolder: `profile/${user._id}/avatar`
        })
        user.image = avatar
        await user.save()
        return user;
    }

    async uploadCoverImage(files: FileType[], user: HUser) {
        if (user.coverImage?.length) {
            await this.cloudService.deleteAssets(user.coverImage)
        }
        const coverImages = files?.length
            ? await this.cloudService.uploadImages({ files, nameFolder: `profile/${user._id}/cover` })
            : [];
        user.coverImage = coverImages
        await user.save()
        return user
    }

    async profile(user: HUser) {
        const { followers, following } = await this.getFollowersAndFollowing(user)
        user.password = undefined
        return { user, followers, following }
    }

    async update({ userName, phone, gender, dateOfBirth }: UpdateDto["body"], { _id }: HUser): Promise<HUser> {
        const user = await this.userRepository.findByIdAndUpdate({
            id: _id,
            update: { userName, phone, gender, dateOfBirth }
        })
        return user as HUser
    }

    async allUsers({ userName, page = 1, limit = 5 }: AllUsersDto["query"], user: HUser) {
        const users = await this.userRepository.paginate({
            filter: userName ? {
                $expr: {
                    $regexMatch: {
                        input: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                        regex: userName, options: "i"
                    }
                }
            } : {},
            select: user.role === RoleUserEnum.USER ?
                this.selectsUserList()
                : this.selectsAdminUserList(),
            page,
            limit
        })
        return users
    }

    async getUser({ id }: { id: string }, user: HUser) {
        if (id === user._id.toString()) return this.profile(user)
        const account = await this.userRepository.findById({
            id: toObjectID(id),
            select: this.selectsPublicProfile(),
        })
        if (!account) throw new NotFoundException("User not found.");
        const { followers, following } = await this.getFollowersAndFollowing(account)
        if (account?.isPrivate) {
            return {
                account: {
                    _id: account._id,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    image: account.image,
                    coverImage: account.coverImage,
                    isPrivate: account.isPrivate,
                    message: "This account is private. You can't access the full profile."
                }
            }
        }
        return { account, followers, following }
    }

    async follow({ id }: { id: string }, user: HUser): Promise<IFollowResponse> {
        if (id === user._id.toString()) {
            throw new NotFoundException("You can't follow yourself.")
        }
        const existingFollow = await this.followRepository.findOneAndDelete({
            filter: {
                follower: user._id,
                following: id
            }
        })
        if (existingFollow) {
            return { status: 200, followed: false, message: "Unfollowed successfully." }
        }
        await this.followRepository.createOne({
            data: {
                follower: user._id,
                following: id
            }
        });
        return { status: 201, followed: true, message: "Followed successfully." }
    }

    async suggestions({ limit }: { limit: number }, user: HUser) {
        const users = await this.userRepository.aggregate({
            pipeline: [{
                $match: { _id: { $ne: user._id } }
            },
            { $sample: { size: limit } },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    userName: 1,
                    image: 1,
                    coverImage: 1,
                    isPrivate: 1
                }
            }],
            options: ({})
        })
        return users
    }
}
export default new UserService()