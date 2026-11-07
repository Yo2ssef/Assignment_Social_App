import { EventEmitter } from 'node:events';
import { sendEmail, verifyEmailTemplate } from './index';
import { EmailSubjectEnums } from '../../enum';
import { IRecipients } from '../../interface';
export const emailEvent = new EventEmitter()
emailEvent.on("sendEmail", async ({
    recipients,
    subject,
    data,
}: {
    recipients: IRecipients,
    subject: EmailSubjectEnums,
    data: { code: number },
}) => {
    try {
        await sendEmail({
            ...recipients,
            subject,
            html: verifyEmailTemplate({
                subject,
                code: data.code,
            }),
        })
    } catch (error) {
        console.log("Error while sending mail:", error);
    }
})