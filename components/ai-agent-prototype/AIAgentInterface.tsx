'use client';

import React, { useState } from 'react';
import { useAIAgent } from '@/hooks/useAIAgent';

export function AIAgentInterface() {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, messageHistory, isLoading, error, clearHistory } = useAIAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-300">
            AI Agent Ready
          </span>
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
            Confluence search via function calling
          </span>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Enter your message
            </label>
            <textarea
              id="message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything... (Try: 'Search Confluence for documentation' or 'Find pages about project setup')"
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Send Message'
              )}
            </button>
            
            <button
              type="button"
              onClick={clearHistory}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-full transition-colors duration-200"
            >
              Clear History
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-red-400">⚠️</div>
            <h3 className="text-red-400 font-medium">Error</h3>
          </div>
          <p className="text-red-300 mt-1">{error.message}</p>
        </div>
      )}

      {/* Message History */}
      <div className="space-y-4">
        {messageHistory.map((message) => (
          <div key={message.id} className="space-y-3">
            {/* User Message */}
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-blue-400 font-medium">You</h4>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-200">{message.message}</p>
            </div>

            {/* AI Response */}
            {message.response && (
              <div className={`rounded-lg p-4 border-l-4 ${
                message.response.isValid 
                  ? 'bg-gray-900 border-green-500' 
                  : 'bg-red-900/20 border-red-500'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      message.response.isValid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      AI Agent
                    </h4>
                    {!message.response.isValid && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                        Validation Failed
                      </span>
                    )}
                  </div>
                  {message.response.metadata && (
                    <span className="text-xs text-gray-500">
                      {message.response.metadata.responseTime}ms
                    </span>
                  )}
                </div>
                
                <p className={`mb-3 ${
                  message.response.isValid ? 'text-gray-200' : 'text-red-300'
                }`}>
                  {message.response.response}
                </p>

                {/* Validation Errors */}
                {message.response.validationErrors && message.response.validationErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/30">
                    <h5 className="text-red-400 text-sm font-medium mb-1">Validation Issues:</h5>
                    <ul className="text-red-300 text-sm space-y-1">
                      {message.response.validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                {message.response.metadata && (
                  <div className="mt-3 text-xs text-gray-500 border-t border-gray-700 pt-2">
                    <span>Model: {message.response.metadata.model}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {messageHistory.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-600">🤖</div>
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            AI Agent Ready
          </h3>
          <p className="text-gray-500">
            Send a message to start your conversation with the AI agent
          </p>
        </div>
      )}
    </div>
  );
}