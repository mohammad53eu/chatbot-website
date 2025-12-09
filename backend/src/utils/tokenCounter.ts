// src/utils/tokenCounter.ts

import { getEncoding, encodingForModel, Tiktoken, TiktokenModel } from "js-tiktoken";

// Try to resolve the correct encoding for a model, fallback to a default
function getEncoder(modelName: TiktokenModel): Tiktoken {
  try {
    return encodingForModel(modelName);
  } catch (err) {
    // Fallback — use a base encoding (cl100k_base works for many modern models)
    return getEncoding("cl100k_base");
  }
}

/**
 * Count tokens for a list of messages (chat format).
 * messages: array of { role, content }
 */
export function countTokensForMessages(
  modelName: TiktokenModel,
  messages: { role: string; content: string }[]
): number {
  const encoder = getEncoder(modelName);
  let total = 0;
  for (const msg of messages) {
    total += encoder.encode(msg.content).length;
  }
  return total;
}

/**
 * Count tokens for a plain string (e.g. user content, system prompt, etc.)
 */
export function countTokensForString(modelName: TiktokenModel, text: string): number {
  const encoder = getEncoder(modelName);
  return encoder.encode(text).length;
}
