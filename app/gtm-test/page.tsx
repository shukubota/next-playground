'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sendGTMEvent } from '@next/third-parties/google';

export default function GTMTestPage() {
  const [eventCount, setEventCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendGTMEvent = (eventName: string, parameters?: Record<string, any>) => {
    sendGTMEvent({ event: eventName, ...parameters });
    setEventCount(prev => prev + 1);
    console.log(`GTM Event sent: ${eventName}`, parameters);
  };

  const handleButtonClick = () => {
    handleSendGTMEvent('button_click', {
      button_name: 'test_button',
      section: 'gtm_test_page'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendGTMEvent('form_submit', {
      form_name: 'test_form',
      section: 'gtm_test_page'
    });
  };

  const handleCustomEvent = () => {
    handleSendGTMEvent('custom_action', {
      action_type: 'manual_trigger',
      timestamp: new Date().toISOString(),
      user_agent: mounted ? navigator.userAgent : 'Unknown'
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
            <p><strong>Library:</strong> @next/third-parties/google</p>
            <p><strong>GTM Script in DOM:</strong> {mounted && document.querySelector('script[src*="googletagmanager.com/gtm.js"]') ? 'Found' : 'Not Found'}</p>
            <p><strong>Container ID:</strong> GTM-N62ZNWG6</p>
            <p><strong>Events sent:</strong> {eventCount}</p>
            <p><strong>User Agent:</strong> {mounted ? navigator.userAgent : 'Loading...'}</p>
            <p><strong>Current URL:</strong> {mounted ? window.location.href : 'Loading...'}</p>
            {mounted && typeof window !== 'undefined' && window.dataLayer && (
              <div className="mt-4">
                <p><strong>dataLayer content:</strong></p>
                <pre className="bg-gray-100 p-2 text-xs overflow-auto max-h-32">
                  {JSON.stringify(window.dataLayer, null, 2)}
                </pre>
              </div>
            )}
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