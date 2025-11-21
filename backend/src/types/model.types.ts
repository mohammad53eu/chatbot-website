import { ProviderName } from "./providers.types";


export interface AvailableModel {
  id: string;
  user_id: string;
  provider: ProviderName;
  model_name: string;
  display_name: string;
  supports_vision: boolean;
  supports_streaming: boolean;
  url: string;
  max_tokens: number | null;
  is_active: boolean;
}