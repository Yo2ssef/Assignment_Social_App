"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const connection_database_1 = require("./database/connection.database");
const config_1 = require("./config/config");
const app = (0, express_1.default)();
(0, connection_database_1.bootStrap)(app, config_1.PORT);
app.use(express_1.default.json());
app.use("/auth", modules_1.authController);
app.use("/user", modules_1.userController);
app.use(middleware_1.globalErrorHandling);
app.all("/*anyThing", (req, res, next) => {
    return res.status(404).json({ message: "Invalid app routing." });
});
