import { ProviderConfig, ProviderName } from "../../types/providers.types.js";
import pool from "../db.js";

export const getProviderConfig = async (
    user_id: string,
    provider: ProviderName
): Promise<ProviderConfig | null> => {
    const result = await pool.query(
        `SELECT * FROM provider_configs 
     WHERE user_id = $1 AND provider = $2`,
    [user_id, provider]
    )

    return result.rows[0] || null;
};


export const  getAllProviderConfigs = async (
  user_id: string
): Promise<ProviderConfig[]> => {
  const result = await pool.query(
    `SELECT * FROM provider_configs 
     WHERE user_id = $1 
     ORDER BY provider`,
    [user_id]
  );

  return result.rows;
};

export const getDefaultProvider = async (
  user_id: string
): Promise<ProviderConfig | null> => {
  const result = await pool.query(
    `SELECT * FROM provider_configs 
     WHERE user_id = $1 AND is_default = true 
     LIMIT 1`,
    [user_id]
  );

  return result.rows[0] || null;
};



export const upsertProviderConfig = async (
  user_id: string,
  provider: ProviderName,
  apiKeyEncrypted?: string | null,
  isDefault: boolean = false,
  baseURL?: string
): Promise<ProviderConfig> => {
  // If setting as default, unset other defaults first
  if (isDefault) {
    await pool.query(
      `UPDATE provider_configs 
       SET is_default = false 
       WHERE user_id = $1`,
      [user_id]
    );
  }

  const result = await pool.query(
    `INSERT INTO provider_configs (user_id, provider, api_key_encrypted, is_default, base_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, provider) 
     DO UPDATE SET 
       api_key_encrypted = COALESCE(EXCLUDED.api_key_encrypted, provider_configs.api_key_encrypted),
       is_default = EXCLUDED.is_default,
       base_url = COALESCE(EXCLUDED.base_url, provider_configs.base_url),
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [user_id, provider, apiKeyEncrypted ?? null, isDefault, baseURL ?? null]
  );

  return result.rows[0];
};



export const deleteProviderConfig = async (
  user_id: string,
  provider: ProviderName
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM provider_configs 
     WHERE user_id = $1 AND provider = $2`,
    [user_id, provider]
  );

  return (result.rowCount ?? 0) > 0;
};

