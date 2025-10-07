// Type definitions for Claude Code MCP tools
// These tools should be available in the global scope when running in Claude Code environment

declare global {
  // Atlassian MCP tools that should be available in Claude Code
  var mcp__Atlassian__atlassianUserInfo: ((params: {}) => Promise<any>) | undefined;
  var mcp__Atlassian__search: ((params: { query: string }) => Promise<any>) | undefined;
  var mcp__Atlassian__getJiraIssue: ((params: { issueIdOrKey: string, cloudId?: string }) => Promise<any>) | undefined;
  var mcp__Atlassian__getConfluencePage: ((params: { pageId: string, cloudId?: string }) => Promise<any>) | undefined;
  var mcp__Atlassian__searchConfluenceUsingCql: ((params: { cql: string, cloudId?: string }) => Promise<any>) | undefined;
  var mcp__Atlassian__getConfluenceSpaces: ((params: { cloudId?: string }) => Promise<any>) | undefined;
  var mcp__Atlassian__getPagesInConfluenceSpace: ((params: { spaceId: string, cloudId?: string }) => Promise<any>) | undefined;
  var mcp__Atlassian__getAccessibleAtlassianResources: (() => Promise<any>) | undefined;
  var mcp__Atlassian__fetch: ((params: { id: string }) => Promise<any>) | undefined;
}

export {};