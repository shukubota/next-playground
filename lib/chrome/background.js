// Background script (Service Worker) for Chrome Extension
console.log('Sample Chrome Extension background script loaded');

// Installation and startup events
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
  
  if (details.reason === 'install') {
    // Initialize default storage values
    chrome.storage.local.set({
      clickCount: 0,
      installDate: Date.now(),
      version: chrome.runtime.getManifest().version
    });
    
    console.log('Extension installed for the first time');
  } else if (details.reason === 'update') {
    console.log('Extension updated from', details.previousVersion);
  }
  
  // Set up context menu
  chrome.contextMenus.create({
    id: 'sample-extension-menu',
    title: 'Sample Extension Action',
    contexts: ['page', 'selection']
  });
  
  // Set up daily cleanup alarm
  chrome.alarms.create('dailyCleanup', {
    delayInMinutes: 1440, // 24 hours
    periodInMinutes: 1440
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, extension loaded');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request, 'from:', sender);

  switch (request.action) {
    case 'contentScriptLoaded':
      handleContentScriptLoaded(request, sender);
      sendResponse({ received: true });
      break;

    case 'getExtensionInfo':
      sendResponse({
        version: chrome.runtime.getManifest().version,
        name: chrome.runtime.getManifest().name
      });
      break;

    case 'logActivity':
      logUserActivity(request.activity, sender);
      sendResponse({ logged: true });
      break;

    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }

  return true; // Keep message channel open
});

// Tab events
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
  updateActiveTabInfo(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
    // Could inject content script here if needed
  }
});

// Context menu setup is now handled in the main onInstalled listener above

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info);
  
  if (info.menuItemId === 'sample-extension-menu') {
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'showMessage',
      message: info.selectionText ? `You selected: "${info.selectionText}"` : 'Context menu activated!'
    }).catch(error => {
      console.log('Could not send message to content script:', error);
    });
  }
});

// Alarm/Timer functionality
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name === 'dailyCleanup') {
    performDailyCleanup();
  }
});

// Helper functions
function handleContentScriptLoaded(request, sender) {
  console.log('Content script loaded on:', request.url);
  
  // Store tab information
  chrome.storage.local.get(['visitedSites'], (result) => {
    const visitedSites = result.visitedSites || [];
    const siteInfo = {
      url: request.url,
      timestamp: request.timestamp,
      tabId: sender.tab.id
    };
    
    visitedSites.push(siteInfo);
    
    // Keep only last 100 entries
    if (visitedSites.length > 100) {
      visitedSites.splice(0, visitedSites.length - 100);
    }
    
    chrome.storage.local.set({ visitedSites });
  });
}

function updateActiveTabInfo(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      chrome.storage.local.set({
        activeTab: {
          id: tab.id,
          url: tab.url,
          title: tab.title,
          timestamp: Date.now()
        }
      });
    }
  });
}

function logUserActivity(activity, sender) {
  const logEntry = {
    activity,
    url: sender.tab?.url,
    timestamp: Date.now(),
    tabId: sender.tab?.id
  };
  
  chrome.storage.local.get(['activityLog'], (result) => {
    const activityLog = result.activityLog || [];
    activityLog.push(logEntry);
    
    // Keep only last 50 entries
    if (activityLog.length > 50) {
      activityLog.splice(0, activityLog.length - 50);
    }
    
    chrome.storage.local.set({ activityLog });
  });
}

function performDailyCleanup() {
  console.log('Performing daily cleanup...');
  
  chrome.storage.local.get(null, (items) => {
    const cleanupTasks = [];
    
    // Clean old activity logs (older than 7 days)
    if (items.activityLog) {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentLogs = items.activityLog.filter(log => log.timestamp > weekAgo);
      if (recentLogs.length !== items.activityLog.length) {
        cleanupTasks.push(chrome.storage.local.set({ activityLog: recentLogs }));
      }
    }
    
    // Clean old visited sites (older than 30 days)
    if (items.visitedSites) {
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentSites = items.visitedSites.filter(site => site.timestamp > monthAgo);
      if (recentSites.length !== items.visitedSites.length) {
        cleanupTasks.push(chrome.storage.local.set({ visitedSites: recentSites }));
      }
    }
    
    Promise.all(cleanupTasks).then(() => {
      console.log('Daily cleanup completed');
    });
  });
}

// Error handling
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension being suspended');
});

// Handle extension unload
self.addEventListener('beforeunload', () => {
  console.log('Background script unloading');
});