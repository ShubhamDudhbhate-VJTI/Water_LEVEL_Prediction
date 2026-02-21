import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, Github, Chrome } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { email: string; name: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (type: 'login' | 'signup') => {
    if (!email || !password || (type === 'signup' && !name)) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate auth process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = {
      email,
      name: name || email.split('@')[0]
    };

    onLogin(user);
    toast({
      title: type === 'login' ? "Welcome back!" : "Account created!",
      description: `Successfully ${type === 'login' ? 'logged in' : 'signed up'} as ${user.name}`
    });
    
    setIsLoading(false);
    onClose();
    
    // Reset form
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSocialAuth = (provider: string) => {
    toast({
      title: "Authentication",
      description: `${provider} authentication requires Supabase integration`,
      variant: "destructive"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass backdrop-blur-md border-border-secondary">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center">Welcome to AI Chat</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sign in to sync your conversations across devices
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-background-tertiary/50 border-border-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-background-tertiary/50 border-border-secondary"
                />
              </div>
            </div>

            <Button 
              onClick={() => handleSubmit('login')} 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-glow glow-primary"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="pl-10 bg-background-tertiary/50 border-border-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-background-tertiary/50 border-border-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-10 bg-background-tertiary/50 border-border-secondary"
                />
              </div>
            </div>

            <Button 
              onClick={() => handleSubmit('signup')} 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-glow glow-primary"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handleSocialAuth('Google')}
            className="bg-background-tertiary/50 border-border-secondary hover:bg-accent/50"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialAuth('GitHub')}
            className="bg-background-tertiary/50 border-border-secondary hover:bg-accent/50"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};