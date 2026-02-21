import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
  onTranscriptUpdate: (transcript: string, isAI: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onSpeakingChange, 
  onTranscriptUpdate 
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(1);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        onSpeakingChange(true);
        break;
      case 'response.audio.done':
        setIsSpeaking(false);
        onSpeakingChange(false);
        break;
      case 'response.audio_transcript.delta':
        if (event.delta) {
          onTranscriptUpdate(event.delta, true);
        }
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          onTranscriptUpdate(event.transcript, false);
        }
        break;
      case 'input_audio_buffer.speech_started':
        setIsListening(true);
        break;
      case 'input_audio_buffer.speech_stopped':
        setIsListening(false);
        break;
    }
  };

  const startConversation = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Voice Chat Connected",
        description: "You can now speak naturally with AI",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start voice chat',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    onSpeakingChange(false);
    
    toast({
      title: "Voice Chat Ended",
      description: "Connection closed successfully",
    });
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 1 : 0);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          className="bg-primary hover:bg-primary/90 text-white gap-2"
          size="sm"
        >
          <Mic className="h-4 w-4" />
          Start Voice Chat
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg border">
            <div className={`flex items-center gap-2 ${isListening ? 'text-green-500' : 'text-muted-foreground'}`}>
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
              <span className="text-sm">
                {isListening ? 'Listening...' : isSpeaking ? 'AI Speaking...' : 'Ready'}
              </span>
            </div>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {volume === 0 ? 
                <VolumeX className="h-3 w-3" /> : 
                <Volume2 className="h-3 w-3" />
              }
            </Button>
          </div>
          
          <Button 
            onClick={endConversation}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <MicOff className="h-4 w-4" />
            End
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;