# Sample Chrome Extension

A complete sample Chrome extension demonstrating common extension patterns and functionality.

## Features

- **Popup Interface**: Clean, modern popup with interactive controls
- **Content Script**: Interacts with web pages to highlight links, count elements, and display custom messages
- **Background Script**: Service worker for background tasks, storage management, and event handling
- **Storage Management**: Persistent storage for user preferences and activity tracking
- **Context Menu**: Right-click menu integration
- **Tab Management**: Active tab monitoring and page navigation detection

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `lib/chrome` directory
4. The extension icon will appear in the toolbar

## Files Structure

```
lib/chrome/
├── manifest.json     # Extension configuration and permissions
├── popup.html       # Popup interface HTML
├── popup.js         # Popup functionality and user interactions
├── content.js       # Content script for web page interaction
├── background.js    # Background service worker
└── README.md        # This file
```

## Usage

### Popup Features
- **Custom Message**: Send a custom message that appears as a notification on the current page
- **Highlight Links**: Temporarily highlight all links on the page with yellow background
- **Count Elements**: Count and display all HTML elements on the page
- **Page Info**: Get basic information about the current page (title, URL, image count)
- **Click Counter**: Tracks how many times you've used the extension features
- **Clear Storage**: Reset all extension data

### Content Script Features
- Automatically injected into all web pages
- Listens for messages from the popup
- Provides visual feedback with animations and notifications
- Monitors page navigation changes (useful for SPAs)

### Background Script Features
- Handles extension lifecycle events
- Manages persistent storage and data cleanup
- Provides context menu integration
- Tracks user activity and visited sites
- Performs daily cleanup of old data

## Permissions

- `activeTab`: Access to the currently active tab
- `storage`: Local storage for preferences and data
- `contextMenus`: Right-click menu integration (implicit)
- `alarms`: Scheduled tasks for cleanup (implicit)

## Development

To modify or extend this extension:

1. Make changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Security Notes

This extension follows Chrome extension security best practices:
- Uses Manifest V3 (latest version)
- Minimal permissions required
- Content Security Policy compliant
- No eval() or inline scripts
- Proper message passing between contexts

## Browser Compatibility

- Chrome 88+ (Manifest V3 requirement)
- Microsoft Edge 88+ (Chromium-based)
- Other Chromium-based browsers with Manifest V3 support