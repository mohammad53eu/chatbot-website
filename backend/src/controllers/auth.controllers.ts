import { Request, Response } from 'express';
import { sanitizeInput, validateLogin, validateRegistration } from '../utils/validation';
import { createUser, emailExists, findUserByEmail, usernameExists } from '../database/queries/userQueries';
import { comparePasswords, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';


export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password } = req.body;

        if(!email || !username || !password) {
            res.status(400).json({
                success: false,
                error: { message: 'Email, username, and password are required'}
            });
            return;
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());
        const sanitizedUsername = sanitizeInput(username);

        const validation = validateRegistration(sanitizedEmail, sanitizedUsername, password);
        if(!validation.isValid){
            res.status(400).json({
                success: false,
                error: { message: validation.message }
            });
            return;
        }

        if (await emailExists(sanitizedEmail)) {
            res.status(409).json({
            success: false,
            error: { message: 'Email already registered' }
        });
        return;
        }

        if (await usernameExists(sanitizedUsername)) {
            res.status(409).json({
                success: false,
                error: { message: 'Username already taken' }
            });
            return;
        }

        const passwordHash = await hashPassword(password);

        const user = await createUser(sanitizedEmail, sanitizedUsername, passwordHash);

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
    } catch (error) {
        console.error('Registeration error: ', error);
        res.status(500).json({
            success: false,
            error: { message: 'Registration failed. Please try again.' }
        });
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: { message: 'Email and password are required' }
            });
            return;
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        const validation = validateLogin(sanitizedEmail, password);

        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                error: { message: validation.message }
        });
        return;
        }

        const user = await findUserByEmail(sanitizedEmail);

        if (!user) {
            res.status(401).json({
                success: false,
                error: { message: 'Invalid email or password' }
            });
            return;
        }

        const isPasswordValid = await comparePasswords(password, user.password_hash);

        if(!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: { message: 'Invalid email or password'}
            });
            return;
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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Login failed. Please try again.' }
        });
    }
};