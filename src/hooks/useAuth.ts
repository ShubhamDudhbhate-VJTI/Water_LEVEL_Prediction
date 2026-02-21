import { useState, useCallback } from 'react';

export interface User {
  email: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (userData: { email: string; name: string }) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      email: userData.email,
      name: userData.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      joinedAt: new Date(),
    };
    
    setUser(newUser);
    localStorage.setItem('chat-user', JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('chat-user');
  }, []);

  const initializeAuth = useCallback(() => {
    const savedUser = localStorage.getItem('chat-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          ...userData,
          joinedAt: new Date(userData.joinedAt)
        });
      } catch (error) {
        localStorage.removeItem('chat-user');
      }
    }
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    initializeAuth,
    isAuthenticated: !!user,
  };
};