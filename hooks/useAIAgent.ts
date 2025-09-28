import { useState } from 'react';
import useSWRMutation from 'swr/mutation';

interface AIRequest {
  message: string;
}

interface AIResponse {
  response: string;
  isValid: boolean;
  validationErrors?: string[];
  metadata?: {
    responseTime: number;
    model: string;
  };
}

interface APIErrorResponse {
  error: string;
  details?: string;
}

// Fetcher function for SWR mutation
async function sendMessageFetcher(url: string, { arg }: { arg: AIRequest }): Promise<AIResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData: APIErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response.json();
}

export function useAIAgent() {
  const [messageHistory, setMessageHistory] = useState<Array<{
    id: string;
    message: string;
    response?: AIResponse;
    timestamp: Date;
  }>>([]);

  const {
    trigger,
    data,
    error,
    isMutating: isLoading,
    reset,
  } = useSWRMutation('/api/ai-agent', sendMessageFetcher);

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Add message to history
    const messageId = Date.now().toString();
    const newMessage = {
      id: messageId,
      message,
      timestamp: new Date(),
    };

    setMessageHistory(prev => [...prev, newMessage]);

    try {
      // Send message to API
      const response = await trigger({ message });

      // Update message history with response
      setMessageHistory(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, response }
            : msg
        )
      );

      return response;
    } catch (err) {
      // Update message history with error
      setMessageHistory(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                response: {
                  response: 'Error: Failed to generate response',
                  isValid: false,
                  validationErrors: [err instanceof Error ? err.message : 'Unknown error'],
                },
              }
            : msg
        )
      );
      throw err;
    }
  };

  const clearHistory = () => {
    setMessageHistory([]);
    reset();
  };

  return {
    sendMessage,
    messageHistory,
    currentResponse: data,
    isLoading,
    error,
    clearHistory,
  };
}