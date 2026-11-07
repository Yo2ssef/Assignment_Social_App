import nodemailer, { SMTPSentMessageInfo } from 'nodemailer';
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from '../../../config/config';
import { IEmail } from '../../interface';
import { BadRequestException } from '../../exception';
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});

export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments = []
}: IEmail): Promise<SMTPSentMessageInfo> => {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) {
            throw new BadRequestException("Missing recipient email address.");
        }
        if (!text?.length && !html?.length && !attachments?.length) {
            throw new BadRequestException("Missing email content.");
        }
        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments,
        });
        console.log("Message sent:", info.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.log("Error while sending mail:", error);
        throw error;
    }
}