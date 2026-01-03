// app/routes/MessagesArea.tsx
import { memo, useCallback, useRef, useEffect, useState } from 'react';
import type { Message } from './types/chat.js';

interface MessageAreaProps {
  messages: Message[];
  provider: string;
  showProviderMenuRegen: boolean;
  regenTargetIndex: number | null;
  setShowProviderMenuRegen: (value: boolean) => void;
  setRegenTargetIndex: (index: number | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  activeConversationId: string | null;
  token: string | null;
  getModelName: (provider: string) => string;
  hasApiKey: boolean;
  setError: (error: string) => void;
}

export default memo(function MessageArea({
  messages,
  provider,
  showProviderMenuRegen,
  regenTargetIndex,
  setShowProviderMenuRegen,
  setRegenTargetIndex,
  setMessages,
  activeConversationId,
  token,
  getModelName,
  hasApiKey,
  setError
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleRegenerate = useCallback(async (e: React.MouseEvent, index: number, providerName: string) => {
    e.stopPropagation();
    setShowProviderMenuRegen(false);
    setRegenTargetIndex(null);

    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    if (!lastUserMessage || !activeConversationId || !token) {
      setError('Cannot regenerate: missing required data');
      return;
    }

    // Check API key for non-ollama providers
    if (providerName !== 'ollama' && !hasApiKey) {
      setError(`Please configure your ${providerName.toUpperCase()} API key first`);
      return;
    }

    // Remove last assistant response
    setMessages(prev => {
      const lastIndex = prev.length - 1;
      return prev[lastIndex]?.role === 'assistant' ? prev.slice(0, -1) : prev;
    });

    // Add new assistant placeholder
    const newAssistant: Message = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: '',
      created_at: new Date().toISOString(),
      provider: providerName
    };
    setMessages(prev => [...prev, newAssistant]);

    const response = await fetch(`http://localhost:4000/api/chat/conversations/${activeConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: lastUserMessage.content,
        model_provider: providerName,
        model_name: getModelName(providerName)
      })
    });

    if (!response.ok) {
      setError('Failed to regenerate response');
      setMessages(prev => prev.slice(0, -1));
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: undefined };
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              setMessages(prev => {
                if (prev.length === 0 || prev[prev.length - 1].role !== 'assistant') return prev;
                const updated = [...prev];
                updated[prev.length - 1] = {
                  ...updated[prev.length - 1],
                  content: (updated[prev.length - 1].content || '') + data.delta
                };
                return updated;
              });
            }
            if (data.error) {
              setError(data.error);
            }
          }
        }
      }
    };
    
    processStream().catch(err => {
      setError('Stream processing error');
    });
  }, [messages, activeConversationId, token, setMessages, setShowProviderMenuRegen, setRegenTargetIndex, getModelName, hasApiKey, setError]);

  const renderMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/### (.*)/g, '<h3 class="text-xl font-bold my-4 text-gray-900 dark:text-slate-100">$1</h3>')
      .replace(/###(.*)/g, '<h3 class="text-xl font-bold my-4 text-gray-900 dark:text-slate-100">$1</h3>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl my-4 overflow-x-auto"><code class="text-sm">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/---/g, '<hr class="border-none h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent my-6">')
      .replace(/\n/g, '<br>');
  };

  const getProviderColor = (providerName: string) => {
    const colors: Record<string, string> = {
      openai: 'from-green-400 to-emerald-500',
      anthropic: 'from-orange-400 to-red-500',
      google: 'from-blue-400 to-indigo-500',
      grok: 'from-purple-400 to-pink-500',
      deepseek: 'from-cyan-400 to-blue-500',
      ollama: 'from-gray-400 to-gray-600',
      huggingface: 'from-yellow-400 to-orange-500'
    };
    return colors[providerName] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-slate-400">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">Welcome to AI Chat</h3>
          <p className="text-gray-600 dark:text-slate-400">Start a conversation with your AI assistant</p>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
              {msg.role === 'user' ? (
                <div className="max-w-xl group">
                  <div className="p-6 rounded-3xl shadow-lg backdrop-blur-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl flex flex-col group">
                  <div className="text-base text-gray-900 dark:text-slate-100 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: renderMessageContent(msg.content) }} />
                  </div>
                  
                  {/* Message Actions */}
                  <div className="flex items-center justify-start gap-2 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/50 dark:border-slate-700/50">
                      <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${getProviderColor(msg.provider || provider)}`}></div>
                      <span className="text-xs text-gray-600 dark:text-slate-300 font-semibold">
                        {(msg.provider || provider).toUpperCase()}
                      </span>
                    </div>
                    
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                      title={copiedId === msg.id ? "Copied!" : "Copy message"}
                    >
                      {copiedId === msg.id ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="relative inline-block">
                      {showProviderMenuRegen && regenTargetIndex === index && (
                        <div className="absolute right-0 top-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl py-2 z-50 w-48">
                          {['openai', 'anthropic', 'google', 'grok', 'deepseek', 'ollama', 'huggingface'].map(p => (
                            <button
                              key={p}
                              onClick={(e) => handleRegenerate(e, index, p)}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 text-sm font-medium transition-all first:rounded-t-2xl last:rounded-b-2xl text-gray-900 dark:text-slate-100 flex items-center gap-3"
                            >
                              <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${getProviderColor(p)}`}></div>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRegenTargetIndex(index);
                          setShowProviderMenuRegen(true);
                        }}
                        className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200"
                        title="Regenerate with different provider"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});