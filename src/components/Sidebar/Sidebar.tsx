import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Trash2, 
  Edit3,
  Brain,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation } from '@/hooks/useChatManager';
import { User } from '@/hooks/useAuth';
import { SettingsModal } from '@/components/Settings/SettingsModal';

interface SidebarProps {
  className?: string;
  conversations: Conversation[];
  activeConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  user?: User | null;
  onAuthClick: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  isCollapsed,
  onToggleCollapsed,
  user,
  onAuthClick,
  onLogout
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  if (isCollapsed) {
    return (
      <div className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border w-16",
        "glass backdrop-blur-md",
        className
      )}>
        {/* Collapsed Header */}
        <div className="p-3 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
            className="w-full h-10 p-0 text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0 text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Recent Conversations (Icons Only) */}
        <ScrollArea className="flex-1">
          <div className="p-1 space-y-1">
            {conversations.slice(0, 5).map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                size="sm"
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "w-full h-10 p-0 transition-colors",
                  activeConversationId === conversation.id
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {user ? (
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="w-full h-10 p-0 text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onAuthClick}
              variant="ghost"
              size="sm"
              className="w-full h-10 p-0 text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogIn className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="w-full h-10 p-0 text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar border-r border-sidebar-border",
      "glass backdrop-blur-md",
      className
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">AI Chat</h1>
              <p className="text-xs text-sidebar-foreground/60">Professional Assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground glow-primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="px-3 py-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative rounded-lg transition-all duration-200",
                  activeConversationId === conversation.id 
                    ? "bg-sidebar-accent border border-sidebar-primary/50" 
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                {editingId === conversation.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={handleSaveEdit}
                      className="w-full bg-transparent text-sm font-medium text-sidebar-foreground border-none outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    className="p-2 cursor-pointer"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MessageSquare className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
                        <span className="font-medium text-sm text-sidebar-foreground truncate">
                          {conversation.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conversation);
                          }}
                          className="p-1 hover:bg-sidebar-accent rounded"
                        >
                          <Edit3 className="w-3 h-3 text-sidebar-foreground/60" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                        >
                          <Trash2 className="w-3 h-3 text-sidebar-foreground/60" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-sidebar-foreground/40 mt-1 pl-6">
                      {formatRelativeTime(conversation.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/30">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            onClick={onAuthClick}
            className="w-full bg-primary hover:bg-primary-glow glow-primary"
            size="sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          size="sm"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
};