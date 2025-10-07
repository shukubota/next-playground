import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check what MCP tools are available in the current environment
export async function GET(request: NextRequest) {
  try {
    const debug: {
      environment: string;
      timestamp: string;
      nodeVersion: string;
      platform: string;
      globalKeys: string[];
      mcpTools: string[];
      envVars: string[];
      possibleMCPAccess: string[];
    } = {
      environment: 'server-side',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      globalKeys: [],
      mcpTools: [],
      envVars: [],
      possibleMCPAccess: []
    };

    // Check global scope for MCP tools
    if (typeof global !== 'undefined') {
      debug.globalKeys = Object.keys(global).filter(key => 
        key.startsWith('mcp__') || 
        key.includes('MCP') || 
        key.includes('Atlassian') ||
        key.includes('tools')
      );
      
      debug.mcpTools = Object.keys(global).filter(key => key.startsWith('mcp__'));
    }

    // Check environment variables
    if (typeof process !== 'undefined' && process.env) {
      debug.envVars = Object.keys(process.env).filter(key => 
        key.includes('CLAUDE') || 
        key.includes('MCP') || 
        key.includes('ANTHROPIC') ||
        key.includes('ATLASSIAN')
      );
    }

    // Check for possible MCP access methods
    const possibleAccessors = ['mcp', 'tools', 'mcpTools', 'atlassianMCP'];
    for (const accessor of possibleAccessors) {
      if (typeof global !== 'undefined' && global[accessor as keyof typeof global]) {
        debug.possibleMCPAccess.push(accessor);
      }
    }

    console.log('🔍 MCP Debug Info:', debug);

    return NextResponse.json({
      success: true,
      debug,
      summary: {
        hasGlobalMCPTools: debug.mcpTools.length > 0,
        hasClaudeCodeEnv: debug.envVars.length > 0,
        hasPossibleMCPAccess: debug.possibleMCPAccess.length > 0,
        totalGlobalKeys: debug.globalKeys.length
      }
    });

  } catch (error) {
    console.error('MCP Debug error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Test specific MCP tool access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolName, params = {} } = body;

    const results: {
      toolName: string;
      params: any;
      timestamp: string;
      available: boolean;
      result: any;
      error: string | null;
    } = {
      toolName,
      params,
      timestamp: new Date().toISOString(),
      available: false,
      result: null,
      error: null
    };

    console.log(`🧪 Testing MCP tool: ${toolName}`);

    // Check if the tool exists in global scope
    if (typeof global !== 'undefined' && global[toolName as keyof typeof global]) {
      try {
        const tool = global[toolName as keyof typeof global];
        
        if (typeof tool === 'function') {
          console.log(`✅ Found MCP tool: ${toolName}`);
          results.available = true;
          
          // Try to call the tool
          const result = await tool(params);
          results.result = result;
          
          console.log(`✅ Successfully called ${toolName}:`, result);
        } else {
          results.error = `${toolName} exists but is not a function`;
        }
      } catch (callError) {
        results.error = callError instanceof Error ? callError.message : 'Call failed';
        console.log(`❌ Error calling ${toolName}:`, callError);
      }
    } else {
      results.error = `${toolName} not found in global scope`;
      console.log(`❌ ${toolName} not found`);
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('MCP tool test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}