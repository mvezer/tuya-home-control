import { Response } from 'express';

export default abstract class BaseController {
    protected respondOk(res: Response, data: any = 'OK', statusCode:number = 200):void {
        res.status(statusCode).json({ data, error: null });
    }

    protected respondError(res: Response, error: string, statusCode:number = 500):void {
        res.status(statusCode).json({ data: null, error });
    }
}