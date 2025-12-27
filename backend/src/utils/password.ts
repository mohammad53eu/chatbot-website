import bcrypt from "bcrypt"
import { getEnv } from "./env.js"

export const hashPassword = async (password: string): Promise<string> => {
    
    const saltRounds = parseInt(getEnv("BCRYPT_ROUNDS" ) || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
}

export const comparePasswords = async (
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
    return isMatch;
};
