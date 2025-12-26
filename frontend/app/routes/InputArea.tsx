// app/routes/InputArea.tsx
import { memo, useCallback } from 'react';

interface InputAreaProps {
  input: string;
  provider: string;
  apiKey: string;
  isSending: boolean;
  showProviderMenu: boolean;
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
  onInputChange,
  onProviderChange,
  onApiKeyChange,
  onSaveKey,
  onSendMessage,
  onToggleProviderMenu
}: InputAreaProps) {
  const providers = ['openai', 'anthropic', 'google', 'grok', 'deepseek', 'ollama', 'huggingface'];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      onSendMessage();
    }
  }, [isSending, onSendMessage]);

  return (
    <div className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-t border-white/50 dark:border-slate-700/50 shadow-2xl flex-shrink-0">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={onToggleProviderMenu}
              className="px-4 py-2 bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-600/80 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-600 shadow-md transition-all font-medium text-sm flex items-center gap-2 text-gray-900 dark:text-slate-100"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
              <svg className={`w-4 h-4 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showProviderMenu && (
              <div className="absolute bottom-14 left-0 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl py-2 z-30">
                {providers.map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      onProviderChange(p);
                      onToggleProviderMenu();
                    }}
                    className="w-full text-left px-6 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 text-sm font-medium transition-all first:rounded-t-2xl last:rounded-b-2xl text-gray-900 dark:text-slate-100"
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="password"
            placeholder="Enter API Key (optional)"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="flex-1 p-3 bg-white/70 dark:bg-slate-700/70 hover:bg-white/90 dark:hover:bg-slate-600/90 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-slate-600 shadow-lg outline-none focus:ring-4 focus:ring-purple-500/20 transition-all text-sm placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100"
          />
          <button
            onClick={onSaveKey}
            disabled={!apiKey.trim()}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-5 bg-white/80 dark:bg-slate-700/80 hover:bg-white/95 dark:hover:bg-slate-600/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 dark:border-slate-600 shadow-xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all text-lg placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100"
          />
          <button
            onClick={onSendMessage}
            disabled={!input.trim() || isSending}
            className={`p-5 rounded-3xl shadow-xl transition-all font-semibold flex items-center justify-center ${
              input.trim()
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 text-white'
                : 'bg-gray-200/50 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
