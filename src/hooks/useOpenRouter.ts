import { useCallback, useState } from 'react';

// Import types from useShakespeare
import type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse, ModelsResponse } from './useShakespeare';

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

// Helper function to handle OpenRouter API errors
async function handleOpenRouterError(response: Response) {
  if (response.status === 401) {
    throw new Error('Invalid API key. Please check your OpenRouter API key.');
  } else if (response.status === 402) {
    throw new Error('Insufficient credits. Please add credits to your OpenRouter account.');
  } else if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  } else if (response.status === 400) {
    try {
      const error = await response.json();
      throw new Error(`Invalid request: ${error.error?.message || error.details || 'Please check your request parameters.'}`);
    } catch {
      throw new Error('Invalid request. Please check your parameters and try again.');
    }
  } else if (response.status >= 500) {
    throw new Error('OpenRouter server error. Please try again in a few moments.');
  } else if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || errorData.details || response.statusText}`);
    } catch {
      throw new Error(`Network error: ${response.statusText}. Please check your connection and try again.`);
    }
  }
}

export function useOpenRouter(apiKey?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get authorization header
  const getAuthHeader = useCallback(() => {
    if (apiKey) {
      return `Bearer ${apiKey}`;
    }

    // Use platform key for non-BYOK users
    const platformKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!platformKey) {
      console.warn('OpenRouter API key not found in environment variables');
      throw new Error('OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY or provide a user API key.');
    }
    return `Bearer ${platformKey}`;
  }, [apiKey]);

  // Chat completion function
  const sendChatMessage = useCallback(async (
    messages: ChatMessage[],
    model: string = 'x-ai/grok-4.1-fast', // Default to Grok 4.1 Fast as requested
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: ChatCompletionRequest = {
        model,
        messages,
        ...options
      };

      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': '11x LOVE LaB',
        },
        body: JSON.stringify(requestBody),
      });

      await handleOpenRouterError(response);
      const result = await response.json();

      // Log usage for token tracking
      if (result.usage) {
        console.log('OpenRouter usage:', result.usage);
      }

      return result;
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Add context for common issues
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
        errorMessage = 'Network error: Please check your internet connection and try again.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  // Streaming chat completion function
  const sendStreamingMessage = useCallback(async (
    messages: ChatMessage[],
    model: string = 'x-ai/grok-4.1-fast', // Default to Grok 4.1 Fast as requested
    onChunk: (chunk: string) => void,
    options?: Partial<ChatCompletionRequest>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: ChatCompletionRequest = {
        model,
        messages,
        stream: true,
        ...options
      };

      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': '11x LOVE LaB',
        },
        body: JSON.stringify(requestBody),
      });

      await handleOpenRouterError(response);

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Add context for common issues
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
        errorMessage = 'Network error: Please check your internet connection and try again.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  // Get available models
  const getAvailableModels = useCallback(async (): Promise<ModelsResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${OPENROUTER_API_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      await handleOpenRouterError(response);
      return await response.json();
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  return {
    // State
    isLoading,
    error,
    isAuthenticated: true, // OpenRouter doesn't require Nostr auth

    // Actions
    sendChatMessage,
    sendStreamingMessage,
    getAvailableModels,
    clearError,
  };
}