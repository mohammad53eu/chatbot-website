//app/routes/chat.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ChatSidebar from './ChatSidebar';
import MessageArea from './MessagesArea';
import InputArea from './InputArea';
import ChatHeader from './ChatHeader';
import type { Conversation, Message } from './types/chat';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);


const [showProviderMenuRegen, setShowProviderMenuRegen] = useState(false);
const [regenTargetIndex, setRegenTargetIndex] = useState<number | null>(null);

// In your main chat page (where ChatSidebar is used)
const handleRenameConversation = async (conversationId: string, newTitle: string) => {
  try {
    const response = await fetch(`http://localhost:4000/api/chat/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) throw new Error('Failed to rename');

    // Optimistically update UI
    setConversations(prev => 
      prev.map(conv => conv.id === conversationId ? { ...conv, title: newTitle } : conv)
    );
  } catch (error) {
    console.error('Rename failed:', error);
    alert('Failed to rename conversation');
  }
};

const handleDeleteConversation = async (conversationId: string) => {
  try {
    const response = await fetch(`http://localhost:4000/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete');

    // Update UI
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // If deleting active conversation, clear it
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete conversation');
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


  const getModelName = (provider: string): string => {
    switch (provider) {
      case 'openai': return 'gpt-4o';
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
  if (!input.trim() || !activeConversationId || !token || isSending) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user' as const,
    content: input,
    created_at: new Date().toISOString()
  };
  
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsSending(true);  

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
    if (!response.ok) throw new Error('Failed to send message');
    
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
      try {
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
                if (data.done) break;
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } finally {
        setIsSending(false);
      }
    };
    
    processStream().catch(err => {
      console.error('Stream error:', err);
      setIsSending(false);
    });
  })
  .catch(err => {
    console.error('Message send error:', err);
    setIsSending(false);
    alert('Failed to send message');
  });
}, [activeConversationId, token, provider, input, isSending]);  


  const saveProviderKey = async () => {
    if (!token || !apiKey.trim()) return;


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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 
    to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 overflow-hidden flex">
      <button 
            onClick={toggleTheme} 
            className="fixed top-6 right-6 p-3 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
          >
            {isDark ? '☀️' : '🌙'}
        </button>
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
        />

       <InputArea
          input={input}
          provider={provider}
          apiKey={apiKey}
          isSending={isSending}
          showProviderMenu={showProviderMenu}
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