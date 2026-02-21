import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import VoiceInterface from '@/components/VoiceInterface/VoiceInterface';
import FileUpload from '@/components/Features/FileUpload';
import MessageSearch from '@/components/Features/MessageSearch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Search, Mic, Upload, Image, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation, Message, Attachment } from '@/hooks/useChatManager';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatContainerProps {
  activeConversation?: Conversation;
  updateConversation?: (conversationId: string, messages: Message[]) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  activeConversation,
  updateConversation 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messages = activeConversation?.messages || [];

  // Live messages ref to avoid stale closures during streaming
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateMessages = (newMessages: Message[]) => {
    if (activeConversation && updateConversation) {
      updateConversation(activeConversation.id, newMessages);
    }
  };

  // Convert selected files to lightweight attachment descriptors
  const mapFilesToAttachments = (files: File[] = []): Attachment[] =>
    files.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      type: f.type || 'application/octet-stream',
      url: URL.createObjectURL(f),
      size: f.size,
    }));

  const handleSendMessage = async (payload: { content: string; attachments?: File[] }) => {
    if (!payload.content.trim() && (!payload.attachments || payload.attachments.length === 0)) return;
    
    setIsLoading(true);
    try {
      // Upload attachments to Supabase first
      const uploadedAttachments: Attachment[] = [];
      if (payload.attachments && payload.attachments.length > 0) {
        for (const file of payload.attachments) {
          const uploadedFile = await uploadFileToSupabase(file);
          if (uploadedFile) {
            uploadedAttachments.push(uploadedFile);
          }
        }
      }

      // Add user message immediately
      const userMsg: Message = {
        id: Date.now().toString(),
        content: payload.content,
        sender: 'user',
        timestamp: new Date(),
        attachments: uploadedAttachments,
      };

      const withUser = [...messagesRef.current, userMsg];
      updateMessages(withUser);
      messagesRef.current = withUser;

      // Save to database if conversation exists
      if (activeConversation) {
        await saveMessageToDatabase(userMsg);
      }

      // Get real AI response
      await getAIResponse(payload.content, uploadedAttachments);
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<Attachment | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const bucket = file.type.startsWith('image/') ? 'chat-images' : 'chat-files';
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        id: fileName,
        name: file.name,
        type: file.type,
        url: urlData.publicUrl,
        size: file.size
      };
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Error",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const saveMessageToDatabase = async (message: Message) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          conversation_id: activeConversation?.id,
          content: message.content,
          sender: message.sender,
          attachments: message.attachments || []
        });

      if (error) throw error;
    } catch (error) {
      console.error('Database save error:', error);
    }
  };

  const getAIResponse = async (content: string, attachments: Attachment[]) => {
    try {
      const aiMsgId = (Date.now() + 1).toString();
      
      // Add empty AI message with streaming indicator
      const aiMsg: Message = {
        id: aiMsgId,
        content: '',
        sender: 'ai',
        timestamp: new Date(),
        streaming: true,
      };

      let withAI = [...messagesRef.current, aiMsg];
      updateMessages(withAI);
      messagesRef.current = withAI;

      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          attachments: attachments,
          conversationHistory: messagesRef.current.slice(-10) // Last 10 messages for context
        }
      });

      if (error) throw error;

      // Stream the response if it's a streaming response
      if (data.response) {
        await streamAIResponse(aiMsgId, data.response);
      }

      // Save AI response to database
      if (activeConversation) {
        await saveMessageToDatabase({
          id: aiMsgId,
          content: data.response,
          sender: 'ai',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('AI response error:', error);
      
      // Remove the loading message and show error
      const withoutLoading = messagesRef.current.filter(msg => msg.streaming);
      updateMessages(withoutLoading);
      messagesRef.current = withoutLoading;
      
      toast({
        title: "AI Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    }
  };

  const streamAIResponse = async (messageId: string, fullResponse: string) => {
    const words = fullResponse.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];

      const updated = messagesRef.current.map((msg) =>
        msg.id === messageId ? { ...msg, content: currentContent } : msg
      );
      updateMessages(updated);
      messagesRef.current = updated;

      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50));
    }

    // Finalize (remove streaming indicator)
    const finalized = messagesRef.current.map((msg) =>
      msg.id === messageId ? { ...msg, content: currentContent, streaming: false } : msg
    );
    updateMessages(finalized);
    messagesRef.current = finalized;
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert blob to file and add as attachment
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const userMsg: Message = {
        id: Date.now().toString(),
        content: 'Voice message',
        sender: 'user',
        timestamp: new Date(),
        attachments: mapFilesToAttachments([file]),
      };

      const withVoice = [...messagesRef.current, userMsg];
      updateMessages(withVoice);
      messagesRef.current = withVoice;

      // Process voice message with AI
      await getAIResponse('Voice message received', mapFilesToAttachments([file]));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process voice message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      // Simulate image generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add image message with placeholder
      const imageMsg: Message = {
        id: Date.now().toString(),
        content: `Generated image: ${prompt}`,
        sender: 'ai',
        timestamp: new Date(),
        attachments: [{
          id: Date.now().toString(),
          name: `generated-image-${Date.now()}.png`,
          type: 'image/png',
          url: 'https://picsum.photos/512/512',
          size: 0
        }]
      };

      const withImage = [...messagesRef.current, imageMsg];
      updateMessages(withImage);
      messagesRef.current = withImage;

      toast({
        title: "Image Generated",
        description: "AI has created your image"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      const attachments = mapFilesToAttachments(files);

      const fileMsg: Message = {
        id: Date.now().toString(),
        content: `Uploaded ${files.length} file(s)`,
        sender: 'user',
        timestamp: new Date(),
        attachments
      };

      const withFiles = [...messagesRef.current, fileMsg];
      updateMessages(withFiles);
      messagesRef.current = withFiles;

      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${files.length} file(s)`
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  const clearChat = () => {
    const clearedMessages = [{
      id: '1',
      content: "Chat cleared! I'm ready to start a fresh conversation. What would you like to discuss?",
      sender: 'ai' as const,
      timestamp: new Date(),
    }];
    updateMessages(clearedMessages);
  };

  const regenerateLastResponse = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.sender === 'user');
    
    if (lastUserMessage) {
      // Remove the last AI response
      const lastAIIndex = messages.map(msg => msg.sender).lastIndexOf('ai');
      if (lastAIIndex > 0) {
        const trimmedMessages = messages.slice(0, lastAIIndex);
        updateMessages(trimmedMessages);
        messagesRef.current = trimmedMessages;
      }
      
      // Regenerate response
      setIsLoading(true);
      try {
        await getAIResponse(lastUserMessage.content, lastUserMessage.attachments || []);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-secondary bg-background-secondary/50 backdrop-blur-sm flex-shrink-0">
        <div>
          <h2 className="font-semibold text-lg gradient-text">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'AI is thinking...' : 'Ready to chat'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={isLoading}
            className="bg-background-tertiary/50 border-border-secondary hover:bg-accent/50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Fixed height container */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-0 pb-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
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
                      <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots"></div>
                      <div className="w-1 h-1 bg-ai-primary rounded-full animate-bounce-dots"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isGeneratingImage && (
              <div className="flex gap-3 p-6 bg-ai-background/50">
                <div className="w-8 h-8 rounded-full bg-ai-primary/20 flex items-center justify-center">
                  <Image className="w-4 h-4 text-ai-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold gradient-ai-text mb-2">AI Assistant</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Generating image...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>


      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border-secondary bg-background/95 backdrop-blur-sm">
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={isLoading ? "AI is thinking..." : "Type your message or use /image [prompt] to generate images..."}
          onImageGenerate={handleGenerateImage}
          onVoiceMessage={handleVoiceMessage}
        />
      </div>
    </div>
  );
};