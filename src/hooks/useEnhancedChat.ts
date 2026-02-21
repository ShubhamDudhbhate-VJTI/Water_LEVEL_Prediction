import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface EnhancedMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file' | 'ai_response';
  metadata?: any;
  user_id?: string;
  created_at: string;
  isUser: boolean;
}

export const useEnhancedChat = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const { toast } = useToast();

  // Load messages from database
  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const enhancedMessages: EnhancedMessage[] = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.type as 'text' | 'image' | 'audio' | 'file' | 'ai_response',
        metadata: msg.metadata,
        user_id: msg.user_id,
        created_at: msg.created_at,
        isUser: msg.type !== 'ai_response'
      })) || [];

      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Failed to load messages",
        description: "Could not load previous messages",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Save message to database
  const saveMessage = useCallback(async (message: Omit<EnhancedMessage, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: message.content,
          type: message.type,
          metadata: message.metadata || {},
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }, []);

  // Send message with AI response
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'audio' | 'file' = 'text', metadata?: any) => {
    try {
      setIsLoading(true);
      setTypingIndicator(true);

      // Save user message
      const userMessage: EnhancedMessage = {
        id: `temp-${Date.now()}`,
        content,
        type,
        metadata,
        created_at: new Date().toISOString(),
        isUser: true
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Save to database
      await saveMessage(userMessage);

      // Get AI response for text messages
      if (type === 'text') {
        const conversationHistory = messages
          .slice(-10) // Last 10 messages for context
          .map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }));

        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: { 
            message: content,
            conversationHistory 
          }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        // Add AI response
        const aiMessage: EnhancedMessage = {
          id: `ai-${Date.now()}`,
          content: data.response,
          type: 'ai_response',
          created_at: new Date().toISOString(),
          isUser: false
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Save AI response to database
        await saveMessage(aiMessage);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  }, [messages, saveMessage, toast]);

  // Text to speech
  const speakMessage = useCallback(async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Play audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();

    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast({
        title: "Speech failed",
        description: "Could not convert text to speech",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Speech to text
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            resolve(data.text);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Error with speech-to-text:', error);
      toast({
        title: "Transcription failed",
        description: "Could not convert speech to text",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Real-time message updates
  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage: EnhancedMessage = {
            id: payload.new.id,
            content: payload.new.content,
            type: payload.new.type as 'text' | 'image' | 'audio' | 'file' | 'ai_response',
            metadata: payload.new.metadata,
            user_id: payload.new.user_id,
            created_at: payload.new.created_at,
            isUser: payload.new.type !== 'ai_response'
          };
          
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    typingIndicator,
    sendMessage,
    speakMessage,
    transcribeAudio,
    loadMessages
  };
};