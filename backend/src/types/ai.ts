// import { z } from "zod";

// /**
//  * Providers your system supports.
//  */
// export const ProviderNameSchema = z.enum([
//   "openai",
//   "anthropic",
//   "grok",
//   "google",
//   "deepseek",
//   "huggingface",
//   "ollama",
// ]);

// export type ProviderName = z.infer<typeof ProviderNameSchema>;

// /**
//  * Metadata describing one provider's capabilities and configuration.
//  * This is NOT user-specific — this is your app’s static reference.
//  */
// export const ProviderMetadataSchema = z.object({
//   provider: ProviderNameSchema,
//   sdkImport: z.string(), // e.g. "@ai-sdk/openai"
//   supportsVision: z.boolean(),
//   supportsStreaming: z.boolean(),
//   defaultUrl: z.string().optional(),
//   requiresOrgId: z.boolean().optional(),
// });

// export type ProviderMetadata = z.infer<typeof ProviderMetadataSchema>;

// /**
//  * Metadata describing a model (this should mirror your DB schema).
//  * Each user has their own entries in available_models.
//  */
// export const ModelMetadataSchema = z.object({
//   id: z.uuid(),
//   user_id: z.uuid(),
//   provider: ProviderNameSchema,
//   model_name: z.string(),      // exact model name for provider
//   display_name: z.string().nullable(),
//   supports_vision: z.boolean(),
//   supports_streaming: z.boolean(),
//   url: z.string(),             // endpoint for this model
//   max_tokens: z.number().nullable(),
//   is_active: z.boolean(),
// });

// export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;

// /**
//  * A message sent to the model.
//  * role: system | user | assistant
//  */
// export const ChatMessageSchema = z.object({
//   role: z.enum(["system", "user", "assistant"]),
//   content: z.string(),
// });

// export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// /**
//  * Parameters given to ANY provider when invoking a model.
//  * Provider adapters will translate this into provider-specific format.
//  */
// export const InvokeParamsSchema = z.object({
//   provider: ProviderNameSchema,
//   modelName: z.string(),
//   messages: z.array(ChatMessageSchema),

//   // Optional extras
//   temperature: z.number().optional(),
//   maxTokens: z.number().optional(),
//   stream: z.boolean().optional(),
//   files: z
//     .array(
//       z.object({
//         filename: z.string(),
//         mimetype: z.string(),
//         buffer: z.instanceof(Buffer),
//       })
//     )
//     .optional(),
// });

// export type InvokeParams = z.infer<typeof InvokeParamsSchema>;

// /**
//  * Unified result type for a completed response.
//  * For streaming, you'll return an async iterator elsewhere.
//  */
// export const InvokeResultSchema = z.object({
//   content: z.string(),
//   modelUsed: z.string(),
//   tokenCount: z.number().optional(),
//   rawResponse: z.any().optional(),
// });

// export type InvokeResult = z.infer<typeof InvokeResultSchema>;

// /**
//  * Streaming result type — you return an async generator of string chunks.
//  * Your provider adapter will normalize them.
//  */
// export type StreamResult = AsyncGenerator<string, void, unknown>;

// /**
//  * Provider Client Wrapper.
//  * Each provider returns a client instance from the AI SDK.
//  * We wrap type as any because each provider returns a different structure.
//  * You will refine this if desired for type-safety.
//  */
// export interface ProviderClient {
//   provider: ProviderName;
//   client: any; // the actual AI SDK client
//   apiKey: string; // decrypted key (short-lived)
//   baseUrl?: string;
// }

// /**
//  * Errors normalized across providers.
//  */
// export class ProviderError extends Error {
//   provider: ProviderName;
//   constructor(provider: ProviderName, message: string) {
//     super(message);
//     this.provider = provider;
//   }
// }
