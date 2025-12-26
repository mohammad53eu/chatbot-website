// app/routes/types/chat.ts
export interface Conversation {
  id: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  provider?: string;
}
