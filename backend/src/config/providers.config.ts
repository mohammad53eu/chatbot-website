import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider-v2';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from '@ai-sdk/xai';



export const PROVIDER_NAMES = [
  'openai',
  'anthropic',
  'grok',
  'google',
  'deepseek',
  'ollama',
  'huggingface'
] as const;



export const PROVIDERS = {
  openai: (apiKey: string, baseURL?: string) =>
    createOpenAI({
      apiKey,
      baseURL: baseURL || 'https://api.openai.com/v1'
    }),

  anthropic: (apiKey: string, baseURL?: string) =>
    createAnthropic({
      apiKey,
      baseURL: baseURL || 'https://api.anthropic.com'
    }),

  grok: (apiKey: string, baseURL?: string) =>
    createXai({
      apiKey,
      baseURL: baseURL || 'https://api.x.ai/v1'
    }),

  google: (apiKey: string, baseURL?: string) =>
    createGoogleGenerativeAI({
      apiKey,
      baseURL: baseURL || 'https://generativelanguage.googleapis.com/v1beta'
    }),

  deepseek: (apiKey: string, baseURL?: string) =>
    createDeepSeek({
      apiKey,
      baseURL: baseURL || 'https://api.deepseek.com/v1',
    }),

  ollama: ( baseURL?: string) =>
    createOllama({
      baseURL: baseURL || 'http://localhost:11434/api'
    }),

  huggingface: (apiKey: string, baseURL?: string) =>
    createOpenAI({
      apiKey,
      baseURL: baseURL || 'https://router.huggingface.co/v1',
    })
} as const;



export const KEYLESS_PROVIDERS = ['ollama'] as const;