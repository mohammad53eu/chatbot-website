import { SafeUser, User } from "../../types/auth.types.js";
import { query } from "../db.js";


export const createUser = async (
  email: string,
  username: string,
  passwordHash: string,
  avatarPath?: string
): Promise<SafeUser> => {
    const result = await query(
        `INSERT INTO users (email, username, password_hash, avatar_path)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, username, avatar_path, created_at`,
        [email, username, passwordHash, avatarPath || null]
    );

    const user = result.rows[0];

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar_path,
        createdAt: user.created_at,
    };
};


export const findUserByEmail = async (email: string): Promise<User | null> => {
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
};


export const findUserByUsername = async (username: string): Promise<User | null> => {
    const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
};


export const findUserById = async (id: string): Promise<SafeUser | null> => {
    const result = await query(
        `SELECT id, email, username, avatar_path, created_at FROM users WHERE id = $1`,
    [id]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar_path,
        createdAt: user.created_at,
    };
};


export const updateUserAvatar = async (
    user_id: string,
    avatar_path: string
): Promise<SafeUser | null> => {
    const result = await query(
        `UPDATE users
        SET avatar_path = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, username, avatar_path, created_at`,
        [avatar_path, user_id]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar_path,
        createdAt: user.created_at,
  };
};





export const emailExists = async (email: string): Promise<boolean> => {
  const result = await query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  );
  return result.rows.length > 0;
};


export const usernameExists = async (username: string): Promise<boolean> => {
  const result = await query(
    'SELECT 1 FROM users WHERE username = $1',
    [username]
  );
  return result.rows.length > 0;
};
