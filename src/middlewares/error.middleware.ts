import { NextFunction, Request, Response} from "express";

export class AppError extends Error {
    constructor(public mensage: string, public statusCode: number = 500) {
        super(mensage);
        this.name = "AppError";
    }
}

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    const bodyParserError = err as Error & { status?: number; type?: string };

    if (bodyParserError.type === "entity.parse.failed" || bodyParserError.status === 400) {
        return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.mensage });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
}