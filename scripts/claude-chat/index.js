#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

// Read environment variables
const projectId = process.env.ANTHROPIC_VERTEX_PROJECT_ID;
const location = process.env.CLOUD_ML_REGION || 'us-east5';
const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4@20250514';

// Initialize Google Auth for Vertex AI
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function readPromptFile() {
  try {
    const promptPath = path.join(__dirname, 'prompt.txt');
    return fs.readFileSync(promptPath, 'utf8').trim();
  } catch (error) {
    console.error('Error reading prompt.txt:', error.message);
    process.exit(1);
  }
}

async function callClaudeViaVertex(message) {
  try {
    // Validate environment variables
    if (!projectId) {
      throw new Error('ANTHROPIC_VERTEX_PROJECT_ID environment variable is required');
    }

    // Get access token for Vertex AI
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    // Construct the URL for Vertex AI Claude API
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${model}:rawPredict`;
    
    // Prepare the request payload for Vertex AI Claude
    const payload = {
      anthropic_version: 'vertex-2023-10-16',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    };

    console.log(`Calling Claude via Vertex AI (${model})...`);
    
    // Make the HTTP request to Vertex AI
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Extract the response text from Vertex AI Claude response
    let responseText = '';
    if (result.content && result.content.length > 0) {
      responseText = result.content[0].text || '';
    } else if (result.predictions && result.predictions.length > 0) {
      // Fallback for different response format
      const prediction = result.predictions[0];
      if (prediction.content && prediction.content.length > 0) {
        responseText = prediction.content[0].text || '';
      }
    }
    
    if (!responseText) {
      throw new Error('No response text received from Claude');
    }
    
    return responseText;
    
  } catch (error) {
    console.error('Error calling Claude via Vertex AI:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    // Read prompt from file
    const prompt = await readPromptFile();
    
    if (!prompt) {
      console.error('No prompt found in prompt.txt');
      process.exit(1);
    }

    // Call Claude via Vertex AI
    const response = await callClaudeViaVertex(prompt);
    
    // Output the result to stdout
    console.log(response);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node.js 18+ with built-in fetch support');
  process.exit(1);
}

// Run the script
main();