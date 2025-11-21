
export const DEFAULT_MODELS = [
  // OpenAI
  { provider: 'openai', model_name: 'gpt-4o', display_name: 'GPT-4 Omni', supports_vision: true, max_tokens: 128000 },
  { provider: 'openai', model_name: 'gpt-4o-mini', display_name: 'GPT-4 Omni Mini', supports_vision: true, max_tokens: 128000 },
  { provider: 'openai', model_name: 'gpt-4-turbo', display_name: 'GPT-4 Turbo', supports_vision: true, max_tokens: 128000 },
  
  // Anthropic
  { provider: 'anthropic', model_name: 'claude-3-5-sonnet-20241022', display_name: 'Claude 3.5 Sonnet', supports_vision: true, max_tokens: 200000 },
  { provider: 'anthropic', model_name: 'claude-3-opus-20240229', display_name: 'Claude 3 Opus', supports_vision: true, max_tokens: 200000 },
  
  // Google
  { provider: 'google', model_name: 'gemini-1.5-pro', display_name: 'Gemini 1.5 Pro', supports_vision: true, max_tokens: 2000000 },
  { provider: 'google', model_name: 'gemini-1.5-flash', display_name: 'Gemini 1.5 Flash', supports_vision: true, max_tokens: 1000000 },
];

// export async function seedUserModels(userId: string) {
//   // Insert default models for new user
//   for (const model of DEFAULT_MODELS) {
//     await db.query(
//       `INSERT INTO available_models (user_id, provider, model_name, display_name, supports_vision, max_tokens)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        ON CONFLICT (user_id, provider, model_name) DO NOTHING`,
//       [userId, model.provider, model.model_name, model.display_name, model.supports_vision, model.max_tokens]
//     );
//   }
// }