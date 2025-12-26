// app/routes/ChatSidebar.tsx
import { memo, useCallback } from 'react';
import type { Conversation } from './types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export default memo(function ChatSidebar({ 
  conversations, 
  activeConversationId, 
  isOpen, 
  onClose, 
  onCreateConversation, 
  onSelectConversation 
}: SidebarProps) {
  return (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl border-r border-white/50 dark:border-slate-700/50 z-40 transform transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0 scale-100 opacity-100' : '-translate-x-full scale-95 opacity-0'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-white/50 dark:border-slate-700/50 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Chats</h2>
          <button
            onClick={() => {
              onCreateConversation();
              onClose();
            }}
            className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* List */}
      <div className="p-4 overflow-y-auto flex-1">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-400 py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mb-4">No chats yet</p>
            <button
              onClick={() => {
                onCreateConversation();
                onClose();
              }}
              className="w-full p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all hover:scale-105 shadow-lg"
            >
              Create New Chat
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                className={`w-full p-5 rounded-2xl transition-all hover:shadow-xl group ${
                  activeConversationId === conv.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-2xl scale-105'
                    : 'bg-white/70 dark:bg-slate-700/70 hover:bg-white dark:hover:bg-slate-600 border border-white/50 dark:border-slate-600 hover:border-purple-200 dark:hover:border-purple-400 hover:-translate-x-1'
                }`}
              >
                <div className="font-semibold text-left truncate text-gray-900 dark:text-slate-100">
                  {conv.title || 'Untitled'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
