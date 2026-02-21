import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { MessageCircle, Sparkles, Mic, Image } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Account Created!" : "Welcome Back!",
          description: isSignUp 
            ? "Your account has been created successfully" 
            : "You have been signed in successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle className="h-12 w-12" />
            <h1 className="text-4xl font-bold">ChatApp</h1>
          </div>
          
          <h2 className="text-3xl font-semibold mb-6">
            Experience the Future of Communication
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Conversations</h3>
                <p className="text-white/80">Chat with advanced AI that understands and responds naturally</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Voice-to-Voice Chat</h3>
                <p className="text-white/80">Speak naturally and hear AI responses in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Image className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Image Generation</h3>
                <p className="text-white/80">Create stunning visuals with AI-powered image generation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Sign up to start your AI chat experience' 
                : 'Sign in to continue your conversations'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading 
                  ? 'Please wait...' 
                  : isSignUp ? 'Create Account' : 'Sign In'
                }
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;