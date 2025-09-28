'use client';

import React from 'react';
import { AIAgentInterface } from '@/components/ai-agent-prototype/AIAgentInterface';

export default function AIAgentPrototypePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              AI Agent Prototype
            </h1>
            <p className="text-gray-400 text-lg">
              Enter your text and get AI-powered responses with validation
            </p>
          </header>
          
          <AIAgentInterface />
        </div>
      </div>
    </div>
  );
}