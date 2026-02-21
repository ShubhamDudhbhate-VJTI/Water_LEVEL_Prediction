import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bot, User, Image, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/hooks/useChatManager';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={cn(
      "flex gap-3 p-6 message-slide-in",
      isAI ? "bg-ai-background/50" : "bg-user-background/50"
    )}>
      <Avatar className={cn(
        "w-8 h-8 ring-2",
        isAI ? "ring-ai-primary/50" : "ring-user-primary/50"
      )}>
        <AvatarFallback className={cn(
          "text-xs font-semibold",
          isAI ? "bg-ai-primary text-primary-foreground" : "bg-user-primary text-primary-foreground"
        )}>
          {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium",
            isAI ? "gradient-ai-text" : "text-user-primary"
          )}>
            {isAI ? 'AI Assistant' : 'You'}
          </span>
          <time className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </time>
        </div>

        <Card className={cn(
          "p-4 shadow-message border-0 hover-lift transition-all duration-300",
          isAI 
            ? "bg-card-secondary/85 backdrop-blur-sm shadow-ai-glow/30" 
            : "bg-card/85 backdrop-blur-sm shadow-elegant"
        )}>
          <div className="prose prose-sm prose-invert max-w-none">
            {message.streaming ? (
              <div className="flex items-center gap-1">
                <span className="text-sm">{message.content}</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots"></div>
                  <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots"></div>
                  <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots"></div>
                </div>
              </div>
            ) : (
              <p className="text-foreground text-sm m-0 leading-relaxed">
                {message.content}
              </p>
            )}
          </div>

          {/* Attachments Display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-background-tertiary/40 rounded-xl border border-border-secondary hover-lift shadow-soft"
                >
                  <div className="w-8 h-8 rounded bg-accent/50 flex items-center justify-center">
                    {attachment.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = attachment.url;
                      link.download = attachment.name;
                      link.click();
                    }}
                    className="p-2 hover:bg-accent/60 rounded-lg transition-all duration-300 interactive-scale hover:shadow-soft"
                  >
                    <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};