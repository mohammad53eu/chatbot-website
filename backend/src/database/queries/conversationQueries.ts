import { Conversation } from "../../types/chat.types.js";
import pool from "../db.js";

// get all conversations from database
export const getAllConversations = async (
    user_id: string
): Promise<Conversation[]> => {
    const result = await pool.query(
        `SELECT * FROM conversations
        WHERE user_id = $1
        ORDER BY updated_at DESC;`,
        [user_id]
    );
    return result.rows;
};

// add a conversation
export const addConversation = async (
    user_id: string,
    title: string,
    settings: Record<string, any>,
    system_prompts?: string
): Promise<Conversation> => {
    const result = await pool.query(
        `INSERT INTO conversations
        (user_id, title, system_prompts, settings)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [user_id, title, system_prompts, settings]
    );
    return result.rows[0];
};

// gets a specific conversation
export const getConversation = async (
    user_id: string,
    conversation_id: string
): Promise<Conversation | null> => {
    const result = await pool.query(
        `SELECT * FROM conversations
        WHERE user_id = $1 AND id = $2
        LIMIT 1`,
        [user_id, conversation_id]
    );
    return result.rows[0] || null;
};

// update the title of the conversation
export const updateConversationTitle = async (
    user_id: string,
    conversation_id: string,
    newTitle: string
): Promise<Conversation | null> => {
    const result = await pool.query(
        `UPDATE conversations
        SET title = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND user_id = $2
        RETURNING *`,
        [conversation_id, user_id, newTitle]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0] as Conversation;
};

// deletes a conversation
export const deleteConversation = async (
    user_id: string,
    conversation_id: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM conversations
        WHERE id = $1 AND user_id = $2`,
        [conversation_id, user_id]
    );

    return (result.rowCount?? 0) > 0;
};