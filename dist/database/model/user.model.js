"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../../common/enum");
const security_1 = require("../../common/security");
const userSchema = new mongoose_1.default.Schema({
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
        required: function () {
            return this.provider == enum_1.ProviderUserEnum.SYSTEM;
        },
    },
    gender: {
        type: Number,
        enum: enum_1.GenderUserEnum,
        default: enum_1.GenderUserEnum.MALE
    },
    role: {
        type: Number,
        enum: enum_1.RoleUserEnum,
        default: enum_1.RoleUserEnum.USER
    },
    provider: {
        type: Number,
        enum: enum_1.ProviderUserEnum,
        default: enum_1.ProviderUserEnum.SYSTEM
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
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
    versionKey: "versionData",
    collection: "USERS_DB"
});
userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`;
});
userSchema.pre("save", async function () {
    if (this.isModified("password"))
        this.password = await (0, security_1.hash)(this.password);
    if (this?.phone && this.isModified("phone"))
        this.phone = (await (0, security_1.encrypt)(this.phone));
});
userSchema.pre("findOneAndUpdate", async function () {
    const updated = this.getUpdate();
    if (updated?.phone)
        updated.phone = (await (0, security_1.encrypt)(updated.phone));
});
userSchema.post("findOne", async function (doc) {
    if (doc?.phone)
        doc.phone = await (0, security_1.decrypt)(doc.phone);
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
