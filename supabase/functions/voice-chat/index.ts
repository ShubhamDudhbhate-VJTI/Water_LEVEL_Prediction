import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  
  socket.onopen = () => {
    console.log("Client WebSocket connected");
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'session.update') {
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
          socket.send(JSON.stringify({ error: 'OpenAI API key not configured' }));
          return;
        }

        // Connect to OpenAI Realtime API
        openAISocket = new WebSocket(
          `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`,
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'OpenAI-Beta': 'realtime=v1'
            }
          }
        );

        openAISocket.onopen = () => {
          console.log("Connected to OpenAI Realtime API");
          
          // Send session configuration
          openAISocket?.send(JSON.stringify({
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: "You are a helpful AI assistant. Be conversational and friendly.",
              voice: "alloy",
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1"
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: "inf"
            }
          }));
        };

        openAISocket.onmessage = (event) => {
          // Forward all messages from OpenAI to client
          socket.send(event.data);
        };

        openAISocket.onerror = (error) => {
          console.error("OpenAI WebSocket error:", error);
          socket.send(JSON.stringify({ error: 'OpenAI connection error' }));
        };

        openAISocket.onclose = () => {
          console.log("OpenAI WebSocket closed");
        };

      } else if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        // Forward client messages to OpenAI
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ error: 'Message processing error' }));
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket disconnected");
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});