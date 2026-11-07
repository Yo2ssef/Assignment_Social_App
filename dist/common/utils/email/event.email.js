"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const index_1 = require("./index");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ recipients, subject, data, }) => {
    try {
        await (0, index_1.sendEmail)({
            ...recipients,
            subject,
            html: (0, index_1.verifyEmailTemplate)({
                subject,
                code: data.code,
            }),
        });
    }
    catch (error) {
        console.log("Error while sending mail:", error);
    }
});
