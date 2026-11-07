export interface IError extends Error {
    status: number;
    extra?: { message: unknown }[]
}