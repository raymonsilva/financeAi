import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../Schemes/UserSchema';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const user = await UserModel.findById(req.userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso permitido apenas para administradores.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao validar privilégios de administrador.' });
  }
};
