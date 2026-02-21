import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  streaming?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const useChatManager = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Welcome Chat',
      messages: [
        {
          id: '1',
          content: "Hello! I'm your AI assistant. I'm here to help answer questions, provide information, and have meaningful conversations. What would you like to talk about today?",
          sender: 'ai',
          timestamp: new Date(),
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState('1');

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createNewConversation = useCallback(() => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [
        {
          id: '1',
          content: "Hello! I'm ready to start a new conversation. What would you like to discuss?",
          sender: 'ai',
          timestamp: new Date(),
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    return newId;
  }, []);

  const updateConversation = useCallback((conversationId: string, messages: Message[]) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        // Auto-generate title from first user message if it's still "New Chat"
        let title = conv.title;
        if (title === 'New Chat' && messages.length > 1) {
          const firstUserMessage = messages.find(m => m.sender === 'user');
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
          }
        }

        return {
          ...conv,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return conv;
    }));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const newConversations = prev.filter(c => c.id !== conversationId);
      
      // If we deleted the active conversation, switch to the first available one
      if (conversationId === activeConversationId && newConversations.length > 0) {
        setActiveConversationId(newConversations[0].id);
      } else if (newConversations.length === 0) {
        // If no conversations left, create a new one
        const newId = createNewConversation();
        return conversations; // createNewConversation will update the state
      }
      
      return newConversations;
    });
  }, [activeConversationId, createNewConversation, conversations]);

  const renameConversation = useCallback((conversationId: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title: newTitle, updatedAt: new Date() }
        : conv
    ));
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    updateConversation,
    deleteConversation,
    renameConversation,
  };
};