"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const utils_1 = require("../../common/utils");
const service_1 = require("../../common/service");
class UserService {
    userRepository;
    followRepository;
    cloudService;
    constructor() {
        this.userRepository = repository_1.userRepository;
        this.followRepository = repository_1.followRepository;
        this.cloudService = service_1.cloudService;
    }
    selectsUserList() {
        return "_id firstName lastName image coverImage isPrivate";
    }
    selectsPublicProfile() {
        return "_id firstName lastName userName image coverImage gender isPrivate createdAt";
    }
    selectsAdminUserList() {
        return "_id firstName lastName email gender role provider phone dateOfBirth coverImage isPrivate createdAt updatedAt confirmEmail userName";
    }
    async getFollowersAndFollowing(user) {
        const followers = await this.followRepository.find({
            filter: { following: user._id },
            options: {
                populate: { path: "follower", select: this.selectsUserList() },
                lean: true
            },
            select: "following createdAt -_id"
        }) ?? [];
        const following = await this.followRepository.find({
            filter: { follower: user._id },
            options: {
                populate: { path: "following", select: this.selectsUserList() },
                lean: true
            },
            select: "following createdAt -_id"
        }) ?? [];
        return {
            followers: followers?.map(ele => ({ ...ele.follower, followAt: ele.createdAt })),
            following: following?.map(ele => ({ ...ele.following, followingAt: ele.createdAt }))
        };
    }
    async uploadProfileImage(file, user) {
        if (user.image?.idImage) {
            await this.cloudService.deleteAsset(user.image?.idImage);
        }
        const avatar = await this.cloudService.uploadImage({
            file,
            nameFolder: `profile/${user._id}/avatar`
        });
        user.image = avatar;
        await user.save();
        return user;
    }
    async uploadCoverImage(files, user) {
        if (user.coverImage?.length) {
            await this.cloudService.deleteAssets(user.coverImage);
        }
        const coverImages = files?.length
            ? await this.cloudService.uploadImages({ files, nameFolder: `profile/${user._id}/cover` })
            : [];
        user.coverImage = coverImages;
        await user.save();
        return user;
    }
    async profile(user) {
        const { followers, following } = await this.getFollowersAndFollowing(user);
        user.password = undefined;
        return { user, followers, following };
    }
    async update({ userName, phone, gender, dateOfBirth }, { _id }) {
        const user = await this.userRepository.findByIdAndUpdate({
            id: _id,
            update: { userName, phone, gender, dateOfBirth }
        });
        return user;
    }
    async allUsers({ userName, page = 1, limit = 5 }, user) {
        const users = await this.userRepository.paginate({
            filter: userName ? {
                $expr: {
                    $regexMatch: {
                        input: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                        regex: userName, options: "i"
                    }
                }
            } : {},
            select: user.role === enum_1.RoleUserEnum.USER ?
                this.selectsUserList()
                : this.selectsAdminUserList(),
            page,
            limit
        });
        return users;
    }
    async getUser({ id }, user) {
        if (id === user._id.toString())
            return this.profile(user);
        const account = await this.userRepository.findById({
            id: (0, utils_1.toObjectID)(id),
            select: this.selectsPublicProfile(),
        });
        if (!account)
            throw new exception_1.NotFoundException("User not found.");
        const { followers, following } = await this.getFollowersAndFollowing(account);
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
            };
        }
        return { account, followers, following };
    }
    async follow({ id }, user) {
        if (id === user._id.toString()) {
            throw new exception_1.NotFoundException("You can't follow yourself.");
        }
        const existingFollow = await this.followRepository.findOneAndDelete({
            filter: {
                follower: user._id,
                following: id
            }
        });
        if (existingFollow) {
            return { status: 200, followed: false, message: "Unfollowed successfully." };
        }
        await this.followRepository.createOne({
            data: {
                follower: user._id,
                following: id
            }
        });
        return { status: 201, followed: true, message: "Followed successfully." };
    }
    async suggestions({ limit }, user) {
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
        });
        return users;
    }
}
exports.UserService = UserService;
exports.default = new UserService();
