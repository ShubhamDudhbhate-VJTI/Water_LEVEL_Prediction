import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import VoiceInterface from '@/components/VoiceInterface/VoiceInterface';
import FileUpload from '@/components/Features/FileUpload';
import MessageSearch from '@/components/Features/MessageSearch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Trash2, Plus, MessageSquare, Volume2, Download, Share } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import { useToast } from '@/components/ui/use-toast';

interface AdvancedChatContainerProps {
  className?: string;
}

export const AdvancedChatContainer: React.FC<AdvancedChatContainerProps> = ({ className }) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages,
    isLoading,
    typingIndicator,
    sendMessage,
    speakMessage,
    transcribeAudio,
    loadMessages
  } = useEnhancedChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingIndicator]);

  const handleSendMessage = async (payload: { content: string; attachments?: File[] }) => {
    if (!payload.content.trim() && (!payload.attachments || payload.attachments.length === 0)) return;
    
    try {
      // Handle image generation command
      if (payload.content.startsWith('/image ')) {
        const prompt = payload.content.replace('/image ', '');
        await generateImage(prompt);
        return;
      }

      // Handle regular message
      await sendMessage(payload.content, 'text');
      
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      const userMessage = `🎨 Generate image: ${prompt}`;
      await sendMessage(userMessage, 'text');
      
      // The AI will handle the image generation through the edge function
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate image",
        variant: "destructive"
      });
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      const transcript = await transcribeAudio(audioBlob);
      if (transcript) {
        await sendMessage(`🎤 ${transcript}`, 'audio');
      }
    } catch (error) {
      console.error('Voice message error:', error);
      toast({
        title: "Voice Error",
        description: "Failed to process voice message",
        variant: "destructive"
      });
    }
  };

  const handleImageGenerate = async (prompt: string) => {
    await generateImage(prompt);
  };

  const clearChat = async () => {
    try {
      await loadMessages(); // Refresh messages from database
      toast({
        title: "Chat Refreshed",
        description: "Messages have been refreshed from the database"
      });
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: "Failed to refresh chat",
        variant: "destructive"
      });
    }
  };

  const exportChat = () => {
    const chatData = {
      exportDate: new Date().toISOString(),
      messagesCount: messages.length,
      messages: messages.map(msg => ({
        content: msg.content,
        type: msg.type,
        timestamp: msg.created_at,
        isUser: msg.isUser
      }))
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${new Date().toLocaleDateString()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Chat history has been downloaded"
    });
  };

  const shareMessage = async (message: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Chat Message',
          text: message.content
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard"
      });
    }
  };

  const filteredMessages = messages.filter(msg =>
    searchQuery ? msg.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className={cn("h-screen flex", className)}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r border-border-secondary bg-background-secondary/30 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border-secondary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg gradient-text">AI Assistant</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="bg-background-tertiary/50 border-border-secondary"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="space-y-3">
              <MessageSearch 
                onResultSelect={(messageId) => {
                  // Scroll to message
                  const messageElement = document.getElementById(`message-${messageId}`);
                  messageElement?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>

          {/* Chat Stats */}
          <div className="p-4 border-b border-border-secondary">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 bg-background-tertiary/30">
                <div className="text-sm text-muted-foreground">Messages</div>
                <div className="text-lg font-semibold">{messages.length}</div>
              </Card>
              <Card className="p-3 bg-background-tertiary/30">
                <div className="text-sm text-muted-foreground">AI Responses</div>
                <div className="text-lg font-semibold">
                  {messages.filter(m => !m.isUser).length}
                </div>
              </Card>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="p-4 space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={cn(
                "w-full justify-start bg-background-tertiary/50 border-border-secondary",
                isVoiceMode && "bg-primary/20 border-primary/50"
              )}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Voice Mode
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportChat}
              className="w-full justify-start bg-background-tertiary/50 border-border-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </Button>

            <FileUpload 
              onFileUploaded={(file) => {
                toast({
                  title: "File Uploaded",
                  description: `Successfully uploaded ${file.name}`
                });
              }}
              onImageGenerated={(imageUrl) => {
                toast({
                  title: "Image Generated",
                  description: "AI has created your image"
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-secondary bg-background-secondary/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(true)}
                className="bg-background-tertiary/50 border-border-secondary"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="font-semibold text-lg gradient-text">AI Chat</h2>
              <p className="text-sm text-muted-foreground">
                {isLoading || typingIndicator ? 'AI is thinking...' : 'Ready to chat'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={isLoading}
              className="bg-background-tertiary/50 border-border-secondary hover:bg-accent/50"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-0 pb-4">
              {filteredMessages.map((message) => (
                <div key={message.id} id={`message-${message.id}`} className="group relative">
                  <ChatMessage 
                    message={{
                      id: message.id,
                      content: message.content,
                      sender: message.isUser ? 'user' : 'ai',
                      timestamp: new Date(message.created_at),
                      attachments: message.metadata?.attachments || []
                    }} 
                  />
                  
                  {/* Message Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {!message.isUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakMessage(message.content)}
                          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareMessage(message)}
                        className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                      >
                        <Share className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingIndicator && (
                <div className="flex gap-3 p-6 bg-ai-background/50">
                  <div className="w-8 h-8 rounded-full bg-ai-primary/20 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-ai-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold gradient-ai-text mb-2">AI Assistant</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">Thinking</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots"></div>
                        <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots animation-delay-100"></div>
                        <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots animation-delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Voice Interface */}
        {isVoiceMode && (
          <div className="border-t border-border-secondary bg-background-secondary/30 p-4">
            <VoiceInterface 
              onSpeakingChange={(speaking) => console.log('Speaking:', speaking)}
              onTranscriptUpdate={(transcript) => console.log('Transcript:', transcript)}
            />
          </div>
        )}

        {/* Chat Input */}
        <div className="border-t border-border-secondary bg-background/95 backdrop-blur-sm">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={isLoading ? "AI is thinking..." : "Type your message or use /image [prompt] to generate images..."}
            onImageGenerate={handleImageGenerate}
            onVoiceMessage={handleVoiceMessage}
          />
        </div>
      </div>
    </div>
  );
};