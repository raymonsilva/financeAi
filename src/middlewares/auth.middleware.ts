import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { AppError } from './error.middleware';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userEmail?: string;
            userRole?: 'user' | 'admin';
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError('Token não fornecido', 401);
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            throw new AppError('Formato de token inválido', 401);
        }

        const [scheme, token] = parts;

        if (scheme !== 'Bearer') {
            throw new AppError('Formato de token inválido', 401);
        }

        const payload = JWTService.verifyToken(token);
        
        req.userId = payload.userId;
        req.userEmail = payload.email;
        req.userRole = payload.role ?? 'user';

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.mensage });
        }
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
