import { Message } from "../../types/chat.types.js";
import pool from "../db.js";


// get all messages in a conversation
export const getConversationMessages = async (
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
    model_used?: string | null,
    status: 'pending' | 'processed' = 'pending',
    error: string | null = null
): Promise<Message> => {
    const result = await pool.query(
        `
        INSERT INTO messages 
            (conversation_id, role, content, token_count, model_provider, model_used, status, error)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [conversation_id, role, content, token_count, model_provider || null, model_used || null, status, error]
    );

    return result.rows[0];
};

// update status of the message, and if there is an error write it in "error"
export const updateMessageStatus = async (
    message_id: string,
    status: 'pending' | 'processed',
    error: string | null = null
): Promise<void> => {
    await pool.query(
        `
        UPDATE messages
        SET status = $1, error = $2
        WHERE id = $3
        `,
        [status, error, message_id]
    );
};


// deletes a message
export const deleteMessage = async (
    message_id: string
): Promise<boolean> => {
    console.log(message_id, "is the id")
    const result = await pool.query(
        `
        DELETE FROM messages
        WHERE id = $1
        `,
        [message_id]
    );

    return (result.rowCount ?? 0) > 0;
};
