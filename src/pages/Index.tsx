import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout/Layout';
import { AdvancedChatContainer } from '@/components/Chat/AdvancedChatContainer';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const Index = () => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <>
        <Layout>
          <div className="flex items-center justify-center h-full">
            <div className="text-lg">Loading...</div>
          </div>
        </Layout>
        <Toaster />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Layout>
        <AdvancedChatContainer />
      </Layout>
      <Toaster />
    </>
  );
};

export default Index;
