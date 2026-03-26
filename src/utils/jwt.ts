import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
    userId: string;
    email: string;
    role?: 'user' | 'admin';
}

export class JWTService {
    static generateToken(payload: JWTPayload, expiresIn: string = '24h'): string {
        return (jwt.sign as any)(payload, env.JWT_SECRET, { expiresIn });
    }

    static verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET as string) as JWTPayload;
        } catch (error) {
            throw new Error('Token inválido ou expirado');
        }
    }

    static decodeToken(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch (error) {
            return null;
        }
    }
}
