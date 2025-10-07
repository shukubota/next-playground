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
            Confluence & Web search via function calling
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
              placeholder="Ask me anything... (Try: 'Search Confluence for documentation' or 'What is the latest Google Play Console update?')"
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
                
                <div className={`mb-3 ${
                  message.response.isValid ? 'text-gray-200' : 'text-red-300'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {message.response.response.split('\n').map((line, index) => {
                      // Check if line is a header
                      if (line.startsWith('##')) {
                        return (
                          <h3 key={index} className="text-lg font-bold text-green-400 mt-4 mb-2 border-b border-green-500/30 pb-1">
                            {line.replace(/^##\s*/, '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('#')) {
                        return (
                          <h2 key={index} className="text-xl font-bold text-blue-400 mt-6 mb-3">
                            {line.replace(/^#\s*/, '')}
                          </h2>
                        );
                      }
                      // Check for status indicators
                      if (line.includes('✅')) {
                        return (
                          <div key={index} className="flex items-start gap-2 my-2 p-2 bg-green-500/10 rounded border-l-2 border-green-500">
                            <span className="text-green-400 text-sm">✅</span>
                            <span className="text-green-300 text-sm">{line.replace('✅', '').trim()}</span>
                          </div>
                        );
                      }
                      if (line.includes('⚠️')) {
                        return (
                          <div key={index} className="flex items-start gap-2 my-2 p-2 bg-yellow-500/10 rounded border-l-2 border-yellow-500">
                            <span className="text-yellow-400 text-sm">⚠️</span>
                            <span className="text-yellow-300 text-sm">{line.replace('⚠️', '').trim()}</span>
                          </div>
                        );
                      }
                      if (line.includes('🔧')) {
                        return (
                          <div key={index} className="flex items-start gap-2 my-2 p-2 bg-blue-500/10 rounded border-l-2 border-blue-500">
                            <span className="text-blue-400 text-sm">🔧</span>
                            <span className="text-blue-300 text-sm">{line.replace('🔧', '').trim()}</span>
                          </div>
                        );
                      }
                      if (line.includes('🟡')) {
                        return (
                          <div key={index} className="flex items-start gap-2 my-2 p-3 bg-orange-500/10 rounded border border-orange-500/30">
                            <span className="text-orange-400 text-sm">🟡</span>
                            <span className="text-orange-300 text-sm font-medium">{line.replace('🟡', '').trim()}</span>
                          </div>
                        );
                      }
                      // Check for bold text
                      if (line.includes('**') && line.trim()) {
                        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
                        return (
                          <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                        );
                      }
                      // Check for list items
                      if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
                        return (
                          <div key={index} className="ml-4 my-1 flex items-start gap-2">
                            <span className="text-gray-500 mt-1">•</span>
                            <span className="text-gray-300">{line.replace(/^[\s\-\d\.]*/, '').trim()}</span>
                          </div>
                        );
                      }
                      // Regular paragraphs
                      if (line.trim()) {
                        return (
                          <p key={index} className="my-2 leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      // Empty lines
                      return <div key={index} className="h-2"></div>;
                    })}
                  </div>
                </div>

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