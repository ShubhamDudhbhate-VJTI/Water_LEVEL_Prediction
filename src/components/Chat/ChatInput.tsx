import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ChatInputProps {
  onSendMessage: (payload: { content: string; attachments?: File[] }) => void;
  onImageGenerate?: (prompt: string) => void;
  onVoiceMessage?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage,
  onImageGenerate,
  onVoiceMessage,
  disabled = false,
  placeholder = "Type your message..." 
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    // Check for image generation command
    if (message.trim().startsWith('/image ') && onImageGenerate) {
      const prompt = message.trim().substring(7);
      if (prompt) {
        onImageGenerate(prompt);
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        return;
      }
    }

    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage({ 
        content: message.trim(), 
        attachments: attachedFiles.length > 0 ? attachedFiles : undefined 
      });
      setMessage('');
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (onVoiceMessage) {
          onVoiceMessage(blob);
        }
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachedFiles(prev => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now, click again to stop"
      });
    } catch (error) {
      toast({
        title: "Recording failed", 
        description: "Please allow microphone access",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Audio saved as attachment"
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="p-6 border-t border-border-secondary bg-background-secondary/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-background-tertiary/60 border border-border-secondary rounded-xl px-3 py-2 shadow-soft hover-lift"
              >
                <span className="text-sm text-foreground truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="glass-strong rounded-2xl p-5 shadow-chat hover-lift">
          <div className="flex items-end gap-4">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-soft interactive-scale transition-all duration-300 rounded-xl"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent",
                  "placeholder:text-muted-foreground focus-visible:ring-1",
                  "focus-visible:ring-input-focus pr-12"
                )}
                style={{ height: '44px' }}
              />
              
              {/* Character/word count could go here */}
              {message.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {message.length}
                </div>
              )}
            </div>

            {/* Voice Recording Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className={cn(
                "transition-all duration-300 interactive-scale rounded-xl",
                isRecording 
                  ? "text-destructive hover:text-destructive/80 bg-destructive/15 shadow-soft glow-ai" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-soft"
              )}
            >
              <Mic className={cn("w-4 h-4", isRecording && "animate-pulse")} />
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="sm"
              className={cn(
                "rounded-xl px-5 py-2 transition-all duration-300 interactive-scale",
                message.trim() && !disabled
                  ? "bg-primary hover:bg-primary-glow glow-primary shadow-button text-primary-foreground font-medium"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};