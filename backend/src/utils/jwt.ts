import jwt from "jsonwebtoken";
import { getEnv } from "./env"

interface JwtPayload {
    user_id: string;
    email: string;
}

export const generateToken = (user_id: string, email: string): string => {

    const payload: JwtPayload = {
        user_id,
        email,
    };

    const expiresInValue = getEnv("JWT_EXPIRES_IN") as any;

    const token = jwt.sign(
        payload,
        getEnv("JWT_SECRET") as string,
        {
            expiresIn: expiresInValue || "24h",
        }
    );
    return token;
};

export const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(
            token,
            getEnv("JWT_SECRET") as string,
        ) as JwtPayload;

        return decoded;

    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError){
            throw new Error('invalid token');
        }
        if(error instanceof jwt.TokenExpiredError){
            throw new Error('token expired');
        }
        throw new Error('token verification failed!');
    }
};