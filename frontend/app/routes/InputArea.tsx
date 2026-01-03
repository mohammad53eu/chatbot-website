// app/routes/InputArea.tsx
import { memo, useCallback, useState } from 'react';

interface InputAreaProps {
  input: string;
  provider: string;
  apiKey: string;
  isSending: boolean;
  showProviderMenu: boolean;
  hasApiKey: boolean;
  onInputChange: (value: string) => void;
  onProviderChange: (provider: string) => void;
  onApiKeyChange: (value: string) => void;
  onSaveKey: () => void;
  onSendMessage: () => void;
  onToggleProviderMenu: () => void;
}

export default memo(function InputArea({
  input,
  provider,
  apiKey,
  isSending,
  showProviderMenu,
  hasApiKey,
  onInputChange,
  onProviderChange,
  onApiKeyChange,
  onSaveKey,
  onSendMessage,
  onToggleProviderMenu
}: InputAreaProps) {
  const providers = ['openai', 'anthropic', 'google', 'grok', 'deepseek', 'ollama', 'huggingface'];
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      onSendMessage();
    }
  }, [isSending, onSendMessage]);

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
    <div className="p-6 bg-transparent backdrop-blur-xl flex-shrink-0">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* API Key Configuration Section */}
        {showApiKeyInput && (
          <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg">
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getProviderColor(provider)}`}></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  {provider.toUpperCase()}
                </span>
              </div>
              <input
                type="password"
                placeholder="Enter API Key"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="flex-1 p-3 bg-white/80 dark:bg-slate-700/80 hover:bg-white/95 dark:hover:bg-slate-600/95 backdrop-blur-sm rounded-xl border border-white/40 dark:border-slate-600 shadow-lg outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100"
              />
              <button
                onClick={onSaveKey}
                disabled={!apiKey.trim()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                Save
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="p-3 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Input Area */}
        <div className="flex gap-3 items-end">
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasApiKey || provider === 'ollama' ? "Type your message..." : "Configure API key first..."}
              disabled={isSending || (!hasApiKey && provider !== 'ollama')}
              rows={1}
              className="w-full p-5 pr-14 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-xl rounded-3xl border-2 border-white/60 dark:border-slate-700/60 shadow-xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all text-lg placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '60px', maxHeight: '200px' }}
            />
            
            {/* Character count indicator */}
            {input.length > 0 && (
              <div className="absolute bottom-2 right-20 text-xs text-gray-400 dark:text-slate-500">
                {input.length}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={onSendMessage}
            disabled={!input.trim() || isSending || (!hasApiKey && provider !== 'ollama')}
            className={`p-5 rounded-3xl shadow-xl transition-all font-semibold flex items-center justify-center ${
              input.trim() && (hasApiKey || provider === 'ollama') && !isSending
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 text-white'
                : 'bg-gray-200/50 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between">
          {/* Left side - API Key & Provider */}
          <div className="flex items-center gap-2">
            {/* Provider Selection */}
            <div className="relative">
              <button
                onClick={onToggleProviderMenu}
                className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm rounded-xl border border-white/60 dark:border-slate-700 shadow-md transition-all text-xs font-medium flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:scale-105 active:scale-95"
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getProviderColor(provider)}`}></div>
                <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                <svg className={`w-3 h-3 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showProviderMenu && (
                <div className="absolute bottom-12 left-0 w-44 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl py-2 z-30">
                  {providers.map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        onProviderChange(p);
                        onToggleProviderMenu();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 text-xs font-medium transition-all first:rounded-t-2xl last:rounded-b-2xl text-gray-900 dark:text-slate-100 flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getProviderColor(p)}`}></div>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* API Key Button */}
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className={`px-3 py-2 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 text-xs font-medium flex items-center gap-2 ${
                hasApiKey
                  ? 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}
              title={hasApiKey ? 'API Key Configured' : 'Configure API Key'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>{hasApiKey ? 'Key configured' : 'Add API key'}</span>
            </button>
          </div>

          {/* Right side - Helper text */}
          {!hasApiKey && provider !== 'ollama' && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>API key required</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});