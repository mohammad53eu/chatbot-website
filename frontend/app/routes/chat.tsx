//app/routes/chat.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.js';
import ChatSidebar from './ChatSidebar.js';
import MessageArea from './MessagesArea.js';
import InputArea from './InputArea.js';
import ChatHeader from './ChatHeader.js';
import type { Conversation, Message } from './types/chat.js';

export default function ChatPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme(); 
  const [token, setToken] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showProviderMenuRegen, setShowProviderMenuRegen] = useState(false);
  const [regenTargetIndex, setRegenTargetIndex] = useState<number | null>(null);

  const handleRenameConversation = async (conversationId: string, newTitle: string) => {
    const response = await fetch(`http://localhost:4000/api/chat/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (response.ok) {
      setConversations(prev => 
        prev.map(conv => conv.id === conversationId ? { ...conv, title: newTitle } : conv)
      );
    } else {
      setError('Failed to rename conversation');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const response = await fetch(`http://localhost:4000/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } else {
      setError('Failed to delete conversation');
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowProviderMenuRegen(false);
      setRegenTargetIndex(null);
    };

    if (showProviderMenuRegen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProviderMenuRegen]);

  // Check auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      navigate('/login');
      return;
    }
    setToken(savedToken);
  }, [navigate]);

  // Check if provider has API key
  useEffect(() => {
    if (!token || !provider) return;
    
    fetch('http://localhost:4000/api/provider/config', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setHasApiKey(data.data.hasKey);
      }
    })
    .catch(() => setHasApiKey(false));
  }, [token, provider]);

  // Fetch conversations when token is ready
  useEffect(() => {
    if (!token) return;
    
    fetch('http://localhost:4000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load conversations');
      return res.json();
    })
    .then(data => {
      setConversations(data.conversations || []);
      if (data.conversations?.length > 0) {
        setActiveConversationId(data.conversations[0].id);
      }
    })
    .catch(err => {
      setError('Failed to load conversations. Please refresh the page.');
    });
  }, [token]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !token) return;
    
    fetch(`http://localhost:4000/api/chat/conversations/${activeConversationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to load messages');
      return res.json();
    })
    .then(data => {
      setMessages(data.messages || []);
    })
    .catch(err => {
      setError('Failed to load messages');
    });
  }, [activeConversationId, token]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const createConversation = async () => {
    if (!token) return;
    
    const res = await fetch('http://localhost:4000/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ settings: { temperature: 0.7 } })
    });
    
    const data = await res.json();
    
    if (data.success) {
      setConversations(prev => [data.conversation, ...prev]);
      setActiveConversationId(data.conversation.id);
      setMessages([]);
    } else {
      setError('Failed to create conversation');
    }
  };

  const getModelName = (provider: string): string => {
    switch (provider) {
      case 'openai': return 'gpt-5-nano';
      case 'anthropic': return 'claude-3-5-sonnet-20241022';
      case 'google': return 'gemini-2.5-flash';
      case 'grok': return 'grok-2024-09-27';
      case 'deepseek': return 'deepseek-coder';
      case 'ollama': return 'llama3.2';
      case 'huggingface': return 'meta-llama/Llama-3.2-1B-Instruct';
      default: return 'gpt-4o';
    }
  };

  const [isSending, setIsSending] = useState(false);  

  const sendMessage = useCallback(() => {
    // Validation checks
    if (!input.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (!activeConversationId) {
      setError('Please create or select a conversation first');
      return;
    }
    
    if (!token) {
      setError('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }
    
    if (isSending) {
      return;
    }

    // Check if API key is configured
    if (!hasApiKey && provider !== 'ollama') {
      setError(`Please configure your ${provider.toUpperCase()} API key first`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setError(null);

    const currentProvider = provider;

    fetch(`http://localhost:4000/api/chat/conversations/${activeConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: userMessage.content,
        model_provider: provider,
        model_name: getModelName(provider)
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'Authentication error' : 'Failed to send message');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      setMessages(prev => {
        const newMessages = [...prev];
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: '',
          created_at: new Date().toISOString(),
          provider: currentProvider
        };
        newMessages.push(assistantMessage);
        return newMessages;
      });

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
              if (data.done) break;
            }
          }
        }
        setIsSending(false);
      };
      
      processStream().catch(err => {
        setError('Stream processing error');
        setIsSending(false);
      });
    })
    .catch(err => {
      setError(err.message === 'Authentication error' ? 'Session expired. Please log in again.' : 'Failed to send message. Please try again.');
      setIsSending(false);
      
      // Remove the user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      
      // Restore input
      setInput(userMessage.content);
    });
  }, [activeConversationId, token, provider, input, isSending, hasApiKey, navigate]);

  const saveProviderKey = async () => {
    if (!token) {
      setError('Authentication error');
      return;
    }
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    const providerBaseUrls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com',
      google: 'https://generativelanguage.googleapis.com/v1',
      grok: 'https://api.x.ai/v1',
      deepseek: 'https://api.deepseek.com/v1',
      ollama: 'http://localhost:11434/api',
      huggingface: 'https://router.huggingface.co/v1'
    };

    const baseUrl = providerBaseUrls[provider] || providerBaseUrls.openai;

    const res = await fetch('http://localhost:4000/api/provider/upsert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        provider, 
        api_key: apiKey,
        base_url: baseUrl
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      setApiKey('');
      setShowProviderMenu(false);
      setHasApiKey(true);
      setError(null);
      // Show success message briefly
      const successMsg = `${provider.toUpperCase()} API key saved successfully`;
      setError(successMsg);
      setTimeout(() => setError(null), 2000);
    } else {
      setError(data.error?.message || 'Failed to save API key');
    }
  };

  if (!token) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 overflow-hidden flex">
      <button 
        onClick={toggleTheme} 
        className="fixed top-6 right-6 p-3 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Error handeler */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            error.includes('success') || error.includes('saved')
              ? 'bg-emerald-50/95 dark:bg-emerald-900/95 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <svg className={`w-5 h-5 flex-shrink-0 ${
                error.includes('success') || error.includes('saved')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {error.includes('success') || error.includes('saved') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <p className={`text-sm font-medium ${
                error.includes('success') || error.includes('saved')
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateConversation={createConversation}
        onSelectConversation={setActiveConversationId}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-80' : 'ml-0'
      }`}>
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <MessageArea
          messages={messages}
          provider={provider}
          showProviderMenuRegen={showProviderMenuRegen}
          regenTargetIndex={regenTargetIndex}
          setShowProviderMenuRegen={setShowProviderMenuRegen}
          setRegenTargetIndex={setRegenTargetIndex}
          setMessages={setMessages}
          activeConversationId={activeConversationId}
          token={token}
          getModelName={getModelName}
          hasApiKey={hasApiKey}
          setError={setError}
        />

        <InputArea
          input={input}
          provider={provider}
          apiKey={apiKey}
          isSending={isSending}
          showProviderMenu={showProviderMenu}
          hasApiKey={hasApiKey}
          onInputChange={setInput}
          onProviderChange={setProvider}
          onApiKeyChange={setApiKey}
          onSaveKey={saveProviderKey}
          onSendMessage={sendMessage}
          onToggleProviderMenu={() => setShowProviderMenu(!showProviderMenu)}
        />
      </div>
    </div>
  );
}