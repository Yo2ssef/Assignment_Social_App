import { EmailSubjectEnums } from '../enum';
export interface IRecipients {
    to?: string[];
    cc?: string[];
    bcc?: string[]
}
export interface IEmail extends IRecipients {
    subject?: EmailSubjectEnums;
    text?: string;
    html?: string;
    attachments?: any[]
} 