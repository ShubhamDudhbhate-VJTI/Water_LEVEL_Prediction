-- Create messages table for persistent chat history
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio', 'file', 'ai_response')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table for file sharing
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_sessions table for voice conversations
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'text' CHECK (session_type IN ('text', 'voice', 'video')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'paused')),
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create user_preferences table for customization
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_play_audio BOOLEAN NOT NULL DEFAULT true,
  voice_id TEXT DEFAULT 'alloy',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table for insights
CREATE TABLE public.chat_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for files
CREATE POLICY "Users can view their own files" ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload their own files" ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own files" ON public.files FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view their own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for analytics
CREATE POLICY "Users can view their own analytics" ON public.chat_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analytics" ON public.chat_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', false);

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own files" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own images" ON storage.objects FOR SELECT USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;