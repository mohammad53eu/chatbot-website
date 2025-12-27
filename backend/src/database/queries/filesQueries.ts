import pool from "../db.js";


export const getConversationFiles = async (
    user_id: string,
    conversation_id: string
) => {
    const result = await pool.query(
        `SELECT *
         FROM files
         WHERE user_id = $1 AND conversation_id = $2
         ORDER BY created_at ASC`,
        [user_id, conversation_id]
    );
    return result.rows;
};
