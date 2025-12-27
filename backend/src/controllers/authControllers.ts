import { Request, Response } from 'express';
import { sanitizeInput, validateLogin, validateRegistration } from '../utils/validation.js';
import { createUser, emailExists, findUserByEmail, usernameExists } from '../database/queries/userQueries.js';
import { comparePasswords, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticationError, ConflictError, DatabaseError, ValidationError } from '../utils/customError.js';


export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = req.body;

    if(!email || !username || !password) {
        throw new ValidationError("Email, username, and password are required");
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedUsername = sanitizeInput(username);

    const validation = validateRegistration(sanitizedEmail, sanitizedUsername, password);
    if(!validation.isValid){
        throw new ValidationError(validation.message);
    }

    if (await emailExists(sanitizedEmail)) {
        throw new ConflictError("Email already registered");
    }

    if (await usernameExists(sanitizedUsername)) {
        throw new ConflictError("Username already taken");
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser(sanitizedEmail, sanitizedUsername, passwordHash);

    if(!user){
        throw new DatabaseError();
    }

    const token = generateToken(user.id, user.email);
    
    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar
            },
            token
        }
    });    
};


export const login = async (req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body;

    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    const validation = validateLogin(sanitizedEmail, password);

    if (!validation.isValid) {
        throw new ValidationError(validation.message);
    }

    const user = await findUserByEmail(sanitizedEmail);

    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(password, user.password_hash);

    if(!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
        success: true,
        data: {
            user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar_path,
            },
            token
        }
    });
};