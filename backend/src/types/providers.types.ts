import { PROVIDER_NAMES } from "../config/providers.config.js";

export type ProviderName = typeof PROVIDER_NAMES[number];

export interface ProviderConfig {
  id: string;
  user_id: string;
  provider: ProviderName;
  api_key_encrypted: string | null;
  base_url: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}