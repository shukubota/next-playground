import { NextRequest, NextResponse } from 'next/server';

// Test actual Atlassian API connection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'connection';

    console.log('🧪 Testing Atlassian connection...');

    // Check if credentials are configured
    const atlassianDomain = process.env.ATLASSIAN_DOMAIN;
    const atlassianEmail = process.env.ATLASSIAN_EMAIL;
    const atlassianApiToken = process.env.ATLASSIAN_API_TOKEN;

    const configStatus = {
      domain: !!atlassianDomain,
      email: !!atlassianEmail,
      token: !!atlassianApiToken,
      domainValue: atlassianDomain || 'Not configured',
      emailValue: atlassianEmail || 'Not configured'
    };

    if (!atlassianDomain || !atlassianEmail || !atlassianApiToken) {
      return NextResponse.json({
        success: false,
        error: 'Atlassian credentials not configured',
        configStatus,
        message: 'Please set ATLASSIAN_DOMAIN, ATLASSIAN_EMAIL, and ATLASSIAN_API_TOKEN environment variables'
      });
    }

    const auth = Buffer.from(`${atlassianEmail}:${atlassianApiToken}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const testResults: {
      configStatus: typeof configStatus;
      tests: Record<string, any>;
    } = {
      configStatus,
      tests: {}
    };

    if (testType === 'connection' || testType === 'all') {
      // Test basic connectivity
      try {
        console.log('🔍 Testing basic connectivity...');
        const connectivityUrl = `https://${atlassianDomain}/rest/api/3/myself`;
        
        const response = await fetch(connectivityUrl, { headers });
        
        if (response.ok) {
          const userData = await response.json();
          testResults.tests.connectivity = {
            success: true,
            user: {
              displayName: userData.displayName,
              emailAddress: userData.emailAddress,
              accountType: userData.accountType
            }
          };
          console.log('✅ Basic connectivity test passed');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        console.error('❌ Connectivity test failed:', error);
        testResults.tests.connectivity = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    if (testType === 'confluence' || testType === 'all') {
      // Test Confluence access
      try {
        console.log('🔍 Testing Confluence access...');
        const confluenceUrl = `https://${atlassianDomain}/wiki/rest/api/space?limit=1`;
        
        const response = await fetch(confluenceUrl, { headers });
        
        if (response.ok) {
          const data = await response.json();
          testResults.tests.confluence = {
            success: true,
            spacesCount: data.size,
            canAccessSpaces: true
          };
          console.log('✅ Confluence access test passed');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        console.error('❌ Confluence test failed:', error);
        testResults.tests.confluence = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    if (testType === 'jira' || testType === 'all') {
      // Test Jira access with multiple API versions
      const jiraApiVersions = ['3', '2'];
      let jiraSuccess = false;
      let jiraResult: any = { success: false };
      
      for (const version of jiraApiVersions) {
        try {
          console.log(`🔍 Testing Jira access (API v${version})...`);
          const jiraUrl = `https://${atlassianDomain}/rest/api/${version}/project?maxResults=1`;
          
          const response = await fetch(jiraUrl, { headers });
          
          if (response.ok) {
            const data = await response.json();
            jiraResult = {
              success: true,
              projectsCount: data.length,
              canAccessProjects: true,
              workingApiVersion: version
            };
            jiraSuccess = true;
            console.log(`✅ Jira access test passed with API v${version}`);
            break;
          } else {
            console.log(`❌ Jira API v${version} failed: ${response.status} ${response.statusText}`);
            if (response.status === 410) {
              console.log(`⚠️  API v${version} is deprecated (410 Gone)`);
            }
          }
          
        } catch (error) {
          console.error(`❌ Jira API v${version} test failed:`, error);
        }
      }
      
      if (!jiraSuccess) {
        jiraResult = {
          success: false,
          error: 'All Jira API versions failed (v3 and v2 tested)',
          testedVersions: jiraApiVersions
        };
      }
      
      testResults.tests.jira = jiraResult;
    }

    if (testType === 'search' || testType === 'all') {
      // Test search functionality
      try {
        console.log('🔍 Testing search functionality...');
        
        // Test Confluence search
        const confluenceSearchUrl = `https://${atlassianDomain}/wiki/rest/api/search?cql=type=page&limit=1`;
        const confluenceResponse = await fetch(confluenceSearchUrl, { headers });
        
        // Test Jira search with new JQL endpoint and legacy fallbacks
        let jiraSearchResult: { accessible: boolean; status: number; error?: string; workingEndpoint?: string } = { accessible: false, status: 0, error: 'All endpoints failed' };
        const searchEndpoints = [
          {
            name: 'New JQL API',
            url: `https://${atlassianDomain}/rest/api/3/search/jql?jql=project is not empty order by created DESC&maxResults=1`
          },
          {
            name: 'Legacy v3',
            url: `https://${atlassianDomain}/rest/api/3/search?jql=order by created DESC&maxResults=1`
          },
          {
            name: 'Legacy v2',
            url: `https://${atlassianDomain}/rest/api/2/search?jql=order by created DESC&maxResults=1`
          }
        ];
        
        for (const endpoint of searchEndpoints) {
          try {
            console.log(`🔍 Testing ${endpoint.name}: ${endpoint.url}`);
            const jiraResponse = await fetch(endpoint.url, { headers });
            
            if (jiraResponse.ok) {
              jiraSearchResult = {
                accessible: true,
                status: jiraResponse.status,
                workingEndpoint: endpoint.name
              };
              console.log(`✅ Jira search working with ${endpoint.name}`);
              break;
            } else {
              console.log(`❌ ${endpoint.name}: ${jiraResponse.status} ${jiraResponse.statusText}`);
              if (jiraResponse.status === 410) {
                const errorText = await jiraResponse.text();
                console.log(`⚠️  ${endpoint.name} deprecated:`, errorText);
              }
            }
          } catch (error) {
            console.log(`❌ ${endpoint.name} error:`, error);
          }
        }
        
        testResults.tests.search = {
          success: true,
          confluence: {
            accessible: confluenceResponse.ok,
            status: confluenceResponse.status
          },
          jira: jiraSearchResult
        };
        
        console.log('✅ Search functionality test completed');
        
      } catch (error) {
        console.error('❌ Search test failed:', error);
        testResults.tests.search = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    const allTestsPassed = Object.values(testResults.tests).every(test => test.success);

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? 'All tests passed! Atlassian integration is working.' : 'Some tests failed. Check the test results for details.',
      testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Atlassian test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Test search with actual query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = 'test' } = body;

    console.log(`🔍 Testing real search with query: "${query}"`);

    const atlassianDomain = process.env.ATLASSIAN_DOMAIN;
    const atlassianEmail = process.env.ATLASSIAN_EMAIL;
    const atlassianApiToken = process.env.ATLASSIAN_API_TOKEN;

    if (!atlassianDomain || !atlassianEmail || !atlassianApiToken) {
      return NextResponse.json({
        success: false,
        error: 'Atlassian credentials not configured'
      });
    }

    const auth = Buffer.from(`${atlassianEmail}:${atlassianApiToken}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const results = {
      confluence: [],
      jira: [],
      query
    };

    try {
      // Search Confluence
      const confluenceUrl = `https://${atlassianDomain}/wiki/rest/api/search?cql=text~"${encodeURIComponent(query)}"&limit=5`;
      const confluenceResponse = await fetch(confluenceUrl, { headers });
      
      if (confluenceResponse.ok) {
        const confluenceData = await confluenceResponse.json();
        results.confluence = confluenceData.results?.map((item: any) => ({
          id: item.content?.id,
          title: item.content?.title,
          type: 'confluence-page',
          url: `https://${atlassianDomain}${item.content?._links?.webui}`,
          space: item.content?.space?.key
        })) || [];
      }
    } catch (error) {
      console.error('Confluence search error:', error);
    }

    try {
      // Search Jira with new JQL endpoint and legacy fallbacks
      const jiraSearchEndpoints = [
        {
          name: 'New JQL API',
          url: `https://${atlassianDomain}/rest/api/3/search/jql?jql=text~"${encodeURIComponent(query)}" AND project is not empty order by created DESC&maxResults=5`,
          fallbackUrl: `https://${atlassianDomain}/rest/api/3/search/jql?jql=project is not empty order by created DESC&maxResults=5`
        },
        {
          name: 'Legacy v3',
          url: `https://${atlassianDomain}/rest/api/3/search?jql=text~"${encodeURIComponent(query)}"&maxResults=5`
        },
        {
          name: 'Legacy v2',
          url: `https://${atlassianDomain}/rest/api/2/search?jql=text~"${encodeURIComponent(query)}"&maxResults=5`
        }
      ];
      
      for (const endpoint of jiraSearchEndpoints) {
        try {
          console.log(`🔍 Trying ${endpoint.name}:`, endpoint.url);
          
          const jiraResponse = await fetch(endpoint.url, { headers });
          
          if (jiraResponse.ok) {
            const jiraData = await jiraResponse.json();
            results.jira = jiraData.issues?.map((issue: any) => ({
              id: issue.key,
              title: `[${issue.key}] ${issue.fields.summary}`,
              type: 'jira-issue',
              url: `https://${atlassianDomain}/browse/${issue.key}`,
              status: issue.fields.status?.name,
              endpoint: endpoint.name
            })) || [];
            
            console.log(`✅ Jira search successful with ${endpoint.name}, found ${results.jira.length} issues`);
            break;
          } else {
            console.log(`❌ ${endpoint.name} failed: ${jiraResponse.status} ${jiraResponse.statusText}`);
            
            // Try fallback for new JQL API
            if (endpoint.fallbackUrl) {
              try {
                console.log(`🔄 Trying fallback without text search...`);
                const fallbackResponse = await fetch(endpoint.fallbackUrl, { headers });
                
                if (fallbackResponse.ok) {
                  const fallbackData = await fallbackResponse.json();
                  results.jira = fallbackData.issues?.map((issue: any) => ({
                    id: issue.key,
                    title: `[${issue.key}] ${issue.fields.summary}`,
                    type: 'jira-issue',
                    url: `https://${atlassianDomain}/browse/${issue.key}`,
                    status: issue.fields.status?.name,
                    endpoint: endpoint.name + ' (fallback)',
                    note: 'Text search not available, showing recent issues'
                  })) || [];
                  
                  console.log(`✅ Fallback successful, found ${results.jira.length} issues`);
                  break;
                }
              } catch (fallbackError) {
                console.log(`❌ Fallback failed:`, fallbackError);
              }
            }
            
            if (jiraResponse.status === 410) {
              const errorText = await jiraResponse.text();
              console.log(`⚠️  ${endpoint.name} is deprecated (410 Gone):`, errorText);
            }
          }
        } catch (error) {
          console.error(`❌ ${endpoint.name} error:`, error);
        }
      }
    } catch (error) {
      console.error('Jira search error:', error);
    }

    const totalResults = results.confluence.length + results.jira.length;

    return NextResponse.json({
      success: true,
      message: `Found ${totalResults} results for "${query}"`,
      results,
      summary: {
        confluenceResults: results.confluence.length,
        jiraResults: results.jira.length,
        totalResults
      }
    });

  } catch (error) {
    console.error('Search test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}