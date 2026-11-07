"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderUserEnum = exports.RoleUserEnum = exports.GenderUserEnum = void 0;
var GenderUserEnum;
(function (GenderUserEnum) {
    GenderUserEnum[GenderUserEnum["MALE"] = 0] = "MALE";
    GenderUserEnum[GenderUserEnum["FEMALE"] = 1] = "FEMALE";
})(GenderUserEnum || (exports.GenderUserEnum = GenderUserEnum = {}));
var RoleUserEnum;
(function (RoleUserEnum) {
    RoleUserEnum[RoleUserEnum["USER"] = 0] = "USER";
    RoleUserEnum[RoleUserEnum["ADMIN"] = 1] = "ADMIN";
})(RoleUserEnum || (exports.RoleUserEnum = RoleUserEnum = {}));
var ProviderUserEnum;
(function (ProviderUserEnum) {
    ProviderUserEnum[ProviderUserEnum["SYSTEM"] = 0] = "SYSTEM";
    ProviderUserEnum[ProviderUserEnum["GOOGLE"] = 1] = "GOOGLE";
})(ProviderUserEnum || (exports.ProviderUserEnum = ProviderUserEnum = {}));
