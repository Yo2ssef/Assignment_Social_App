import { NextFunction, Request, Response } from 'express';
export interface IResponse {
    message?: string;
    status?: number;
    data?: any;
}
export type CustomHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<Response | IResponse> | Response | IResponse;