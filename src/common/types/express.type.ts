import { HUser } from "../../database/model/user.model.js";
import { JwtPayloadType } from "./payload.type";
declare module "express-serve-static-core" {
    interface Request {
        validated:any;
        user:HUser;
        payload:JwtPayloadType;
    }
}