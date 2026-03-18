import { NextFunction, Request, Response} from "express";

export class AppError extends Error {
    constructor(public mensage: string, public statusCode: number = 500) {
        super(mensage);
        this.name = "AppError";
    }
}

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.mensage });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
}