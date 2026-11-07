import mongoose, { HydratedDocument } from 'mongoose';
import { GenderUserEnum, ProviderUserEnum, RoleUserEnum } from '../../common/enum';
import { IUser } from '../../common/interface';
import { hash, encrypt, decrypt } from '../../common/security';

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
        image: String,
        coverImage: [String],
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
userSchema.pre("findOneAndUpdate", async function () {
    const updated = this.getUpdate() as any;
    if (updated?.phone) updated.phone = (await encrypt(updated.phone)) as string
})
userSchema.post("findOne", async function (doc) {
    if (doc?.phone) doc.phone = await decrypt(doc.phone);
})

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export type HUser = HydratedDocument<IUser>