import mongoose, { HydratedDocument } from 'mongoose';
import { GenderUserEnum, ProviderUserEnum, RoleUserEnum } from '../../common/enum';
import { IUser } from '../../common/interface';
import { hash, encrypt, decrypt } from '../../common/security';
import { BadRequestException } from '../../common/exception';
import { imageConstants } from '../../common/utils';
const userSchema = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 2, maxLength: 20
        },
        lastName: {
            type: String,
            minLength: 2, maxLength: 20
        },
        email: {
            type: String,
            required: true,
            unique: [true, "Email already exists."]
        },
        password: {
            type: String,
            required: function (): boolean {
                return this.provider == ProviderUserEnum.SYSTEM
            },
        },
        gender: {
            type: Number,
            enum: GenderUserEnum,
            default: GenderUserEnum.MALE
        },
        role: {
            type: Number,
            enum: RoleUserEnum,
            default: RoleUserEnum.USER
        },
        provider: {
            type: Number,
            enum: ProviderUserEnum,
            default: ProviderUserEnum.SYSTEM
        },
        phone: String,
        dateOfBirth: Date,
        image: imageConstants,
        coverImage: [imageConstants],
        isPrivate: {
            type: Boolean,
            default: false
        },
        confirmEmail: Date,
        changeCredentialsTime: Date,
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        optimisticConcurrency: true,
        versionKey: "versionData",
        collection: "USERS_DB"
    }
)

userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || []
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`
})

userSchema.pre("save", async function () {
    if (this.isModified("password")) this.password = await hash(this.password as string)
    if (this?.phone && this.isModified("phone")) this.phone = (await encrypt(this.phone)) as string
})
userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], async function () {
    // console.log({ getQuery: this.getQuery() });

    const updated = this.getUpdate() as HUser;
    // console.log(updated);

    if (updated?.phone) updated.phone = (await encrypt(updated.phone)) as string
})
userSchema.post(["findOne", "find"], async function (doc) {
    // console.log({ getFilter: this.getFilter(), doc });
    if (doc?.phone) doc.phone = await decrypt(doc.phone);
})
userSchema.pre("validate", function () {
    if (this.provider === ProviderUserEnum.GOOGLE && this.password) {
        throw new BadRequestException("Password should not be provided for Google provider.")
    }
})

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export type HUser = HydratedDocument<IUser>