// app/routes/ChatSidebar.tsx
import { memo } from 'react';
import type { Conversation } from './types/chat.js';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;  
  onDeleteConversation: (id: string) => void;                   
}

export default memo(function ChatSidebar({ 
  conversations, 
  activeConversationId, 
  isOpen, 
  onClose, 
  onCreateConversation, 
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation
}: SidebarProps) {
  return (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-r border-white/50 dark:border-slate-700/50 z-40 transform transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0 scale-100 opacity-100' : '-translate-x-full scale-95 opacity-0'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-white/50 dark:border-slate-700/50 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Conversations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={() => {
            onCreateConversation();
            onClose();
          }}
          className="w-full p-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>
      
      {/* List */}
      <div className="p-4 overflow-y-auto flex-1" style={{ height: 'calc(100vh - 180px)' }}>
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-400 py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">No conversations yet</p>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <div key={conv.id} className="group relative">
                <button
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`w-full p-4 pr-24 rounded-2xl transition-all text-left relative overflow-hidden ${
                    activeConversationId === conv.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-[1.02]'
                      : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 border border-white/50 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeConversationId === conv.id
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        activeConversationId === conv.id ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${
                        activeConversationId === conv.id ? 'text-white' : ''
                      }`}>
                        {conv.title || 'New Chat'}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        activeConversationId === conv.id ? 'text-white/70' : 'text-gray-500 dark:text-slate-400'
                      }`}>
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Actions - hover to reveal */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 z-20 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // prompt
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
                      modal.innerHTML = `
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4">
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Rename Conversation</h3>
                          <input 
                            type="text" 
                            id="rename-input"
                            value="${(conv.title || 'New Chat').replace(/"/g, '&quot;')}"
                            class="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-slate-100"
                            placeholder="Enter new name"
                          />
                          <div class="flex gap-3 mt-6">
                            <button 
                              id="cancel-btn"
                              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all font-medium"
                            >
                              Cancel
                            </button>
                            <button 
                              id="save-btn"
                              class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-medium"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      `;
                      document.body.appendChild(modal);
                      
                      const input = document.getElementById('rename-input') as HTMLInputElement;
                      input.focus();
                      input.select();
                      
                      const handleSave = () => {
                        const newTitle = input.value.trim();
                        if (newTitle) {
                          onRenameConversation(conv.id, newTitle);
                        }
                        document.body.removeChild(modal);
                      };
                      
                      const handleCancel = () => {
                        document.body.removeChild(modal);
                      };
                      
                      document.getElementById('save-btn')?.addEventListener('click', handleSave);
                      document.getElementById('cancel-btn')?.addEventListener('click', handleCancel);
                      input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      });
                      modal.addEventListener('click', (e) => {
                        if (e.target === modal) handleCancel();
                      });
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      activeConversationId === conv.id
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    }`}
                    title="Rename"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // confirm
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
                      modal.innerHTML = `
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4">
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Delete Conversation</h3>
                          <p class="text-gray-600 dark:text-slate-400 mb-6">Are you sure you want to delete "${(conv.title || 'New Chat').replace(/"/g, '&quot;')}"? This action cannot be undone.</p>
                          <div class="flex gap-3">
                            <button 
                              id="cancel-delete-btn"
                              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all font-medium"
                            >
                              Cancel
                            </button>
                            <button 
                              id="confirm-delete-btn"
                              class="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      `;
                      document.body.appendChild(modal);
                      
                      const handleDelete = () => {
                        onDeleteConversation(conv.id);
                        document.body.removeChild(modal);
                      };
                      
                      const handleCancel = () => {
                        document.body.removeChild(modal);
                      };
                      
                      document.getElementById('confirm-delete-btn')?.addEventListener('click', handleDelete);
                      document.getElementById('cancel-delete-btn')?.addEventListener('click', handleCancel);
                      modal.addEventListener('click', (e) => {
                        if (e.target === modal) handleCancel();
                      });
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      activeConversationId === conv.id
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                    }`}
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});