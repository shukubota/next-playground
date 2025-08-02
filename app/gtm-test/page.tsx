'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GTMTestPage() {
  const [eventCount, setEventCount] = useState(0);

  const sendGTMEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
      setEventCount(prev => prev + 1);
      console.log(`GTM Event sent: ${eventName}`, parameters);
    } else {
      console.warn('Google Tag Manager (gtag) is not available');
    }
  };

  const handleButtonClick = () => {
    sendGTMEvent('button_click', {
      button_name: 'test_button',
      section: 'gtm_test_page'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendGTMEvent('form_submit', {
      form_name: 'test_form',
      section: 'gtm_test_page'
    });
  };

  const handleCustomEvent = () => {
    sendGTMEvent('custom_action', {
      action_type: 'manual_trigger',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold mb-6">Google Tag Manager Test Page</h1>
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Event Testing</h2>
          <p className="text-gray-600 mb-4">
            This page allows you to test Google Tag Manager events. 
            Events sent: <span className="font-bold text-blue-600">{eventCount}</span>
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleButtonClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Send Button Click Event
            </button>
            
            <button 
              onClick={handleCustomEvent}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors ml-4"
            >
              Send Custom Event
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Form Event Testing</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="testInput" className="block text-sm font-medium text-gray-700 mb-1">
                Test Input
              </label>
              <input 
                type="text" 
                id="testInput"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter some text..."
              />
            </div>
            <button 
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
            >
              Submit Form (Sends GTM Event)
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">GTM Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>GTM Available:</strong> {typeof window !== 'undefined' && window.gtag ? 'Yes' : 'No'}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Open browser developer tools to see console logs</li>
            <li>• Use Google Tag Manager Preview mode to see events in real-time</li>
            <li>• Check GTM Debug panel or Google Analytics Real-time reports</li>
            <li>• Each button click will increment the event counter</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}