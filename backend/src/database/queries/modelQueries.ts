import { AvailableModel } from "../../types/model.types";
import { ProviderName } from "../../types/providers.types";
import pool from "../db";

// load all available models for a specific provider
export const getAvailableModels = async (
  user_id: string,
  provider: ProviderName
): Promise<AvailableModel[]> => {
  const query = provider
    ? `SELECT * FROM available_models 
       WHERE user_id = $1 AND provider = $2 AND is_active = true 
       ORDER BY provider, model_name`
    : `SELECT * FROM available_models 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY provider, model_name`;

  const params = provider ? [user_id, provider] : [user_id];
  const result = await pool.query(query, params);

  return result.rows;
};

// get a specific model
export const getModel = async (
  user_id: string,
  provider: ProviderName,
  modelName: string
): Promise<AvailableModel | null> => {
  const result = await pool.query(
    `SELECT * FROM available_models 
     WHERE user_id = $1 AND provider = $2 AND model_name = $3`,
    [user_id, provider, modelName]
  );

  return result.rows[0] || null;
};

// add a new model to the table of available models
export const addModel = async (
  user_id: string,
  provider: ProviderName,
  modelName: string,
  displayName: string,
  url: string,
  supportsVision: boolean = false,
  supportsStreaming: boolean = true,
  supports_tools: boolean = false,
  maxTokens?: number
): Promise<AvailableModel> => {
  const result = await pool.query(
    `INSERT INTO available_models 
     (user_id, provider, model_name, display_name, url, supports_vision, supports_streaming, supports_tools, max_tokens)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [user_id, provider, modelName, displayName, url, supportsVision, supportsStreaming, supports_tools, maxTokens || null]
  );

  return result.rows[0];
};


// export async function updateModel(
//   user_id: string,
//   model_id: string,
//   updates: Partial<Omit<AvailableModel, 'id' | 'user_id' | 'provider'>>
// ): Promise<AvailableModel> {
//   const fields = [];
//   const values = [];
//   let paramIndex = 1;

//   if (updates.display_name !== undefined) {
//     fields.push(`display_name = $${paramIndex++}`);
//     values.push(updates.display_name);
//   }
//   if (updates.url !== undefined) {
//     fields.push(`url = $${paramIndex++}`);
//     values.push(updates.url);
//   }
//   if (updates.supports_vision !== undefined) {
//     fields.push(`supports_vision = $${paramIndex++}`);
//     values.push(updates.supports_vision);
//   }
//   if (updates.supports_streaming !== undefined) {
//     fields.push(`supports_streaming = $${paramIndex++}`);
//     values.push(updates.supports_streaming);
//   }
//   if (updates.max_tokens !== undefined) {
//     fields.push(`max_tokens = $${paramIndex++}`);
//     values.push(updates.max_tokens);
//   }
//   if (updates.is_active !== undefined) {
//     fields.push(`is_active = $${paramIndex++}`);
//     values.push(updates.is_active);
//   }

//   values.push(user_id, model_id);

//   const result = await pool.query(
//     `UPDATE available_models 
//      SET ${fields.join(', ')} 
//      WHERE user_id = $${paramIndex++} AND id = $${paramIndex++}
//      RETURNING *`,
//     values
//   );

//   return result.rows[0];
// };

// deletes a model from the table
export async function deleteModel(
  user_id: string,
  model_id: string
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM available_models 
     WHERE user_id = $1 AND id = $2`,
    [user_id, model_id]
  );

  return (result.rowCount?? 0) > 0;
};