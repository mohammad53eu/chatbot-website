export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    system_prompts?: string |  null;
    settings: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    token_count: number;
    model_provider?: string | null; // only required for assistant messages
    model_used?: string | null;     // only required for assistant messages
    created_at: Date;
}