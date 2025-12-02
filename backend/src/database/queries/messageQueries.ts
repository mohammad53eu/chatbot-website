import { Message } from "../../types/chat.types";
import pool from "../db";


// get all messages in a conversation
export const getMessages = async (
    conversation_id: string
): Promise<Message[]> => {
    const result = await pool.query(
        `
        SELECT * FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        `,
        [conversation_id]
    );
    return result.rows;
};

// adds a message
export const addMessage = async (
    conversation_id: string,
    role: 'user' | 'assistant',
    content: string,
    token_count: number,
    model_provider?: string | null,
    model_used?: string | null
): Promise<Message> => {
    const result = await pool.query(
        `
        INSERT INTO messages 
            (conversation_id, role, content, token_count, model_provider, model_used)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [conversation_id, role, content, token_count, model_provider || null, model_used || null]
    );

    return result.rows[0];
};



// deletes a message
export const deleteMessage = async (
    conversation_id: string,
    message_id: string
): Promise<boolean> => {
    const result = await pool.query(
        `
        DELETE FROM messages
        WHERE id = $1
        AND conversation_id = $2
        `,
        [message_id, conversation_id]
    );

    return (result.rowCount ?? 0) > 0;
};
