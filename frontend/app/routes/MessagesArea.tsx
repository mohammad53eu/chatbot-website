// app/routes/MessageArea.tsx
import { memo, useCallback, useRef, useEffect } from 'react';
import type { Message } from './types/chat'; // Adjust import path

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
  getModelName
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRegenerate = useCallback(async (e: React.MouseEvent, index: number, providerName: string) => {
    e.stopPropagation();
    setShowProviderMenuRegen(false);
    setRegenTargetIndex(null);

    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    if (!lastUserMessage || !activeConversationId || !token) return;

    // Remove LAST assistant response
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

    // DIRECT API CALL
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

    if (!response.ok) return;

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
            try {
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
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    };
    processStream();
  }, [messages, activeConversationId, token, setMessages, setShowProviderMenuRegen, setRegenTargetIndex, getModelName]);

  const renderMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*)/g, '<h3 style="font-size:1.25rem;font-weight:bold;margin:1em 0">$1</h3>')
      .replace(/###(.*)/g, '<h3 style="font-size:1.25rem;font-weight:bold;margin:1em 0">$1</h3>')
      .replace(/-- -/g, '<hr style="border:none;height:1px;background:linear-gradient(to right,#ccc,#eee,#ccc);margin:2em 0">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50 max-w-4xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-slate-400">
          <div className="w-24 h-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Welcome to AI Chat</h3>
          <p>Start a conversation with your AI assistant</p>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-8`}>
              {msg.role === 'user' ? (
                <div className="max-w-xl p-6 rounded-3xl shadow-lg backdrop-blur-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <p className="text-base leading-relaxed">{msg.content}</p>
                  <p className="text-xs mt-2 text-purple-100 opacity-75">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-3xl flex flex-col group">
                  <div className="mb-4 text-base text-gray-900 dark:text-slate-100 leading-relaxed pr-12">
                    <div dangerouslySetInnerHTML={{ __html: renderMessageContent(msg.content) }} />
                  </div>
                  {/*name*/}
                  <div className="flex items-center justify-start gap-2 opacity-60 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {(msg.provider || provider).toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-all duration-200"
                      title="Copy message"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    <div className="relative inline-block">
                      {showProviderMenuRegen && regenTargetIndex === index && (
                        <div className="absolute right-0 top-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl py-1 z-50 w-44 min-w-[160px]">
                          {['openai', 'anthropic', 'google', 'grok', 'deepseek', 'ollama', 'huggingface'].map(p => (
                            <button
                              key={p}
                              onClick={(e) => handleRegenerate(e, index, p)}
                              className="w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 text-sm font-medium transition-all first:rounded-t-2xl last:rounded-b-2xl text-gray-900 dark:text-slate-100"
                            >
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
                        className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded transition-all duration-200"
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
