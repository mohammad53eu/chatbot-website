import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { findUserById } from '../database/queries/userQueries';


export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            res.status(401).json({
                success: false,
                error: { message: "No authorization header provided"}
            });
            return
        }

        const parts = authHeader.split(' ');

        if(parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({
                success: false,
                error: { message: 'Invalid authorization header format. Use: Bearer <token>' }
             });
            return;
        }

        const token = parts[1];

        const decoded = verifyToken(token);

        const user = await findUserById(decoded.user_id);

        if (!user) {
            res.status(401).json({
                success: false,
                error: { message: 'User no longer exists' }
            });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email,
            username: user.username
        };

        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed';

        res.status(401).json({
            success: false,
            error: { message }
        });
    }
};

