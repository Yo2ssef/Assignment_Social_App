export class ApplicationException extends Error {
    constructor(message: string = "Something went wrong.", public status: number = 400, cause?: unknown) {
        super(message, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}