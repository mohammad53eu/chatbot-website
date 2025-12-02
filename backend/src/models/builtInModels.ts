import { AvailableModel } from "../types/model.types";
import { ProviderName } from "../types/providers.types";


export const builtinModels: Record<ProviderName, Omit<AvailableModel, "id" | "user_id">[]> = {
  openai: [
    {
      provider: "openai",
      model_name: "gpt-4o",
      display_name: "GPT-4o",
      supports_vision: false,
      supports_streaming: true,
      supports_tools: true,
      url: "https://api.openai.com/v1",
      max_tokens: 8192,
      is_active: true
    },
    {
      provider: "openai",
      model_name: "gpt-3.5-turbo",
      display_name: "GPT-3.5 Turbo",
      supports_vision: false,
      supports_streaming: true,
      supports_tools: false,
      url: "https://api.openai.com/v1",
      max_tokens: 4096,
      is_active: true
    }
  ],
  anthropic: [
    {
      provider: "anthropic",
      model_name: "claude-3.1",
      display_name: "Claude 3.1",
      supports_vision: false,
      supports_streaming: true,
      supports_tools: false,
      url: "https://api.anthropic.com",
      max_tokens: 9000,
      is_active: true
    }
  ],
  grok: [],
  google: [],
  deepseek: [],
  ollama: [],
  huggingface: []
};
