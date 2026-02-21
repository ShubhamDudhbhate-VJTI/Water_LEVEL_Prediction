import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { AuthModal } from '@/components/Auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Menu, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatManager } from '@/hooks/useChatManager';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    updateConversation,
    deleteConversation,
    renameConversation,
  } = useChatManager();

  const { user, login, logout, initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "relative z-50 transition-all duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "w-16" : "w-80 lg:w-72 xl:w-80",
        "flex-shrink-0"
      )}>
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={createNewConversation}
          onSelectConversation={setActiveConversationId}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
          isCollapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
          onAuthClick={() => setAuthModalOpen(true)}
          onLogout={logout}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border-secondary bg-background-secondary/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:bg-accent/50"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-foreground hover:bg-accent/50"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </header>

        {/* Desktop Header Controls */}
        <div className="hidden lg:flex absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-foreground/60 hover:text-foreground hover:bg-background-tertiary/50 backdrop-blur-sm"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {React.cloneElement(children as React.ReactElement, {
            activeConversation,
            updateConversation
          })}
        </div>

        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-ai-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
      />
    </div>
  );
};