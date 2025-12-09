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
    status: 'pending' | 'processed';
    error: string | null;
    created_at: Date;
}

export interface  Files{
    id: string;
    user_id: string;
    conversation_id: string;
    file_name: string;
    file_type: string;
    mime_type: string;
    file_path: string;
    file_size: number;
    created_at: Date;
}