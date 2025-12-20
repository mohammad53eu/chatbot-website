// frontend/app/routes/chat.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  title: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Check auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      navigate('/login');
      return;
    }
    setToken(savedToken);
  }, [navigate]);

  // Fetch conversations when token is ready
  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:4000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setConversations(data.conversations || []);
      if (data.conversations?.length > 0) {
        setActiveConversationId(data.conversations[0].id);
      }
    })
    .catch(err => {
      console.error('Failed to load conversations:', err);
      alert('Failed to load chats');
    });
  }, [token]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !token) return;

    fetch(`http://localhost:4000/api/chat/conversations/${activeConversationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMessages(data.messages || []);
    })
    .catch(err => {
      console.error('Failed to load messages:', err);
    });
  }, [activeConversationId, token]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConversationId || !token) return;

    // Start user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const getModelName = (provider: string): string => {
    switch (provider) {
    case 'openai': return 'gpt-4o';
    case 'anthropic': return 'claude-3-5-sonnet-20241022';
    case 'google': return 'gemini-2.5-flash';
    case 'grok': return 'grok-2024-09-27';
    case 'deepseek': return 'deepseek-coder';
    case 'ollama': return 'llama3.2'; // or your local model
    case 'huggingface': return 'meta-llama/Llama-3.2-1B-Instruct';
    default: return 'gpt-4o';
    }
    };

    // Send POST request to start streaming
    fetch(`http://localhost:4000/api/chat/conversations/${activeConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: input,
        model_provider: provider,
        model_name: getModelName(provider)
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Process SSE stream
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
                  assistantMessage = {
                    ...assistantMessage,
                    content: assistantMessage.content + data.delta
                  };
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.id === assistantMessage.id) {
                      return [...prev.slice(0, -1), assistantMessage];
                    }
                    return prev;
                  });
                }
                if (data.done) break;
                if (data.error) {
                  console.error('AI error:', data.error);
                  break;
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      };
      processStream().catch(console.error);
    })
    .catch(err => {
      console.error('Message send error:', err);
      alert('Failed to send message');
    });
  };

  const saveProviderKey = async () => {
    if (!token || !apiKey.trim()) return;

    // Default base URLs for each provider
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
      alert('API key saved');
      setApiKey('');
      setShowProviderMenu(false);
    } else {
      alert('Failed to save key: ' + (data.error?.message || 'Unknown error'));
    }
  };

  if (!token) return null;

  return (
    <div className="flex h-screen bg-[#E5E5E5]">
      {/* Sidebar */}
      <div className="w-64 bg-[#D9D9D9] p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-[#333]">Chats</h2>
          <button
            onClick={createConversation}
            className="text-lg text-[#2A0B5C]"
          >
            +
          </button>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`p-2 rounded cursor-pointer ${
                activeConversationId === conv.id
                  ? 'bg-[#2A0B5C] text-white'
                  : 'bg-white text-[#333]'
              }`}
            >
              {conv.title || 'Untitled'}
            </div>
          ))}
        </div>
        {/* Provider dropdown */}
        <div className="mt-4">
          <div className="relative">
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="w-full p-2 bg-white text-[#333] text-left rounded border border-[#999]"
            >
              {provider}
            </button>
            {showProviderMenu && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#999] rounded shadow">
                {['openai', 'anthropic', 'google', 'grok', 'deepseek', 'ollama', 'huggingface'].map(p => (
                  <div
                    key={p}
                    onClick={() => {
                      setProvider(p);
                      setShowProviderMenu(false);
                    }}
                    className="p-2 hover:bg-[#F0EFEF] cursor-pointer"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2">
            <input
              type="password"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 text-sm border border-[#999] rounded bg-white outline-none"
            />
            <button
              onClick={saveProviderKey}
              className="mt-1 w-full p-1 text-xs bg-[#2A0B5C] text-white rounded"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto bg-[#E5E5E5]">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Start a conversation</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block p-3 rounded ${
                    msg.role === 'user'
                      ? 'bg-[#2A0B5C] text-white'
                      : 'bg-white text-[#333] border border-[#999]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-[#999] bg-[#D9D9D9]">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-[#999] rounded-l bg-white outline-none"
            />
            <button
              onClick={sendMessage}
              className="px-4 bg-[#2A0B5C] text-white rounded-r hover:bg-[#3E0F7D]"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}