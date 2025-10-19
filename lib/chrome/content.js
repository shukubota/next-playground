// Content script - runs in the context of Google Play Console
console.log('Play Console Auto-Fill Extension loaded');

// Check if we're on a Play Console page
const isPlayConsole = window.location.hostname === 'play.google.com' && 
                      window.location.pathname.includes('/console/');

if (isPlayConsole) {
  console.log('Play Console detected, initializing auto-fill functionality');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  switch (request.action) {
    case 'fillAppName':
      fillAppName(request.appName, (success) => {
        sendResponse({ success, message: success ? 'App name filled successfully' : 'Could not find app name field' });
      });
      return true; // Keep message channel open for async response
      break;

    case 'fillShortDescription':
      fillShortDescription(request.description, (success) => {
        sendResponse({ success, message: success ? 'Short description filled successfully' : 'Could not find short description field' });
      });
      return true; // Keep message channel open for async response
      break;

    case 'fillDetailedDescription':
      fillDetailedDescription(request.description, (success) => {
        sendResponse({ success, message: success ? 'Detailed description filled successfully' : 'Could not find detailed description field' });
      });
      return true; // Keep message channel open for async response
      break;

    case 'detectPlayConsoleFields':
      const fields = detectPlayConsoleFields();
      sendResponse({ fields });
      break;
      
    case 'debugCurrentPage':
      debugCurrentPage();
      sendResponse({ success: true, message: 'Debug info logged to console' });
      break;

    case 'showMessage':
      showCustomMessage(request.message);
      sendResponse({ success: true });
      break;
      
    case 'uploadIcon':
      const iconSuccess = uploadAppIcon(request.iconData, request.fileName);
      sendResponse({ success: iconSuccess, message: iconSuccess ? 'Icon uploaded successfully' : 'Could not upload icon' });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }

  return true; // Keep message channel open for async response
});

function showCustomMessage(message) {
  // Create a notification div
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4285f4;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;

  // Add slide-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  notification.textContent = `Extension Message: ${message}`;
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }
  }, 5000);

  // Allow manual close on click
  notification.addEventListener('click', () => {
    notification.remove();
    style.remove();
  });
}

function highlightAllLinks() {
  const links = document.querySelectorAll('a[href]');
  const originalStyles = new Map();

  links.forEach((link, index) => {
    // Store original styles
    originalStyles.set(link, {
      backgroundColor: link.style.backgroundColor,
      border: link.style.border,
      padding: link.style.padding
    });

    // Apply highlight styles
    link.style.backgroundColor = '#ffeb3b';
    link.style.border = '2px solid #ff9800';
    link.style.padding = '2px 4px';
    link.style.borderRadius = '3px';
    
    // Add a data attribute for identification
    link.dataset.extensionHighlighted = 'true';
  });

  // Remove highlights after 10 seconds
  setTimeout(() => {
    links.forEach(link => {
      const original = originalStyles.get(link);
      if (original && link.dataset.extensionHighlighted) {
        link.style.backgroundColor = original.backgroundColor;
        link.style.border = original.border;
        link.style.padding = original.padding;
        delete link.dataset.extensionHighlighted;
      }
    });
  }, 10000);

  return links.length;
}

function countAllElements() {
  const elements = document.querySelectorAll('*');
  const counts = {};
  
  elements.forEach(element => {
    const tagName = element.tagName.toLowerCase();
    counts[tagName] = (counts[tagName] || 0) + 1;
  });

  // Log detailed counts to console
  console.log('Element counts by tag:', counts);
  
  // Show summary in a temporary overlay
  const summary = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => `${tag}: ${count}`)
    .join(', ');

  showTemporaryOverlay(`Top elements: ${summary}`);

  return elements.length;
}

function getPageInformation() {
  const images = document.querySelectorAll('img');
  const links = document.querySelectorAll('a[href]');
  const forms = document.querySelectorAll('form');
  const scripts = document.querySelectorAll('script');

  const info = {
    title: document.title,
    url: window.location.href,
    imageCount: images.length,
    linkCount: links.length,
    formCount: forms.length,
    scriptCount: scripts.length,
    bodyText: document.body.innerText.substring(0, 200) + '...'
  };

  // Log detailed info to console
  console.log('Page information:', info);

  return info;
}

// Play Console Store Listing specific functions
function fillAppName(appName, callback) {
  // Target the specific app name field based on actual Google Play Console structure
  const selectors = [
    // Specific Google Play Console selectors based on HTML analysis
    'input[aria-label="アプリの名前"]',
    'input[aria-label*="アプリの名前"]',
    'localized-text-input[debug-id="app-name-input"] input',
    'material-input[debug-id="text-input"] input[aria-label*="アプリ"]',
    
    // More specific Material Design selectors
    'input.mdc-text-field__input[aria-label*="アプリ"]',
    'input.mdc-text-field__input[aria-label="アプリの名前"]',
    
    // Debug-id based selectors
    'input[debugid="acx_264709916"]',
    '[debug-id="app-name-input"] input',
    
    // Fallback selectors
    'input[aria-label*="App name"]',
    'input[aria-label*="application name"]',
    'textarea[aria-label*="アプリ名"]',
    'input[aria-label*="アプリ名"]',
    
    // Generic Material Design input (very last resort)
    'material-input input.mdc-text-field__input:first-of-type'
  ];
  
  console.log('Filling app name with value:', appName);
  fillField(selectors, appName, callback);
}

function fillShortDescription(description, callback) {
  // Target the "簡単な説明" field based on actual structure
  const selectors = [
    // Specific Google Play Console selectors
    'input[aria-label="アプリの簡単な説明"]',
    'input[aria-label*="アプリの簡単な説明"]',
    'localized-text-input[debug-id="short-description-input"] input',
    
    // Material Design selectors
    'input.mdc-text-field__input[aria-label*="簡単な説明"]',
    'input.mdc-text-field__input[aria-label*="短い説明"]',
    
    // Debug-id based selectors
    '[debug-id="short-description-input"] input',
    
    // Fallback selectors
    'input[aria-label*="Short description"]',
    'textarea[aria-label*="簡単な説明"]',
    'input[aria-label*="簡単な説明"]',
    
    // Position-based (less reliable)
    'material-input input.mdc-text-field__input:nth-of-type(2)'
  ];
  
  fillField(selectors, description, callback);
}

function fillDetailedDescription(description, callback) {
  // Target the "詳しい説明" field based on actual structure
  const selectors = [
    // Specific Google Play Console selectors
    'textarea[aria-label="アプリの詳しい説明"]',
    'textarea[aria-label*="アプリの詳しい説明"]',
    'localized-text-input[debug-id="full-description-input"] textarea',
    
    // Material Design textarea selectors
    'textarea.mdc-text-field__input[aria-label*="詳しい説明"]',
    'material-input[debug-id="text-area-input"] textarea',
    
    // Debug-id based selectors
    '[debug-id="full-description-input"] textarea',
    
    // Row-based selectors (detailed descriptions typically have more rows)
    'textarea[rows="7"]',
    'textarea[rows="8"]',
    'textarea[rows="10"]',
    
    // Fallback selectors
    'textarea[aria-label*="Full description"]',
    'textarea[aria-label*="詳しい説明"]',
    'div[contenteditable="true"]',
    
    // Generic fallback
    'material-input textarea.mdc-text-field__input'
  ];
  
  fillField(selectors, description, callback);
}

function fillField(selectors, value, callback) {
  console.log('Attempting to fill field with value:', value);
  console.log('Trying selectors:', selectors);
  
  for (const selector of selectors) {
    const field = document.querySelector(selector);
    if (field) {
      console.log(`Found field with selector: ${selector}`, field);
      
      try {
        // Focus the field first
        field.focus();
        
        // Wait a moment for any focus handlers
        setTimeout(() => {
          // Clear existing value
          if (field.tagName === 'DIV' && field.contentEditable === 'true') {
            // For contenteditable divs
            field.innerHTML = '';
            field.textContent = value;
            
            // Trigger all possible events for contenteditable
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('blur', { bubbles: true }));
          } else {
            // For input and textarea elements - use multiple approaches
            
            // Method 1: Direct property setting
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
            
            if (field.tagName === 'INPUT' && nativeInputValueSetter) {
              nativeInputValueSetter.call(field, value);
            } else if (field.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
              nativeTextAreaValueSetter.call(field, value);
            }
            
            // Method 2: Clear and set value
            field.value = '';
            field.value = value;
            
            // Method 3: Simulate typing (for Angular Material)
            field.select();
            document.execCommand('insertText', false, value);
            
            // Trigger comprehensive events for Angular/Material Design
            field.dispatchEvent(new Event('focus', { bubbles: true }));
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
            field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
            field.dispatchEvent(new Event('blur', { bubbles: true }));
            
            // Angular-specific events
            field.dispatchEvent(new CustomEvent('input', { bubbles: true }));
            field.dispatchEvent(new CustomEvent('change', { bubbles: true }));
          }
          
          // Ensure the field loses focus to save changes
          setTimeout(() => {
            field.blur();
            console.log(`Successfully filled field. New value: "${field.value || field.textContent}"`);
            if (callback) callback(true);
          }, 100);
          
        }, 50);
        
        return; // Exit function, callback will be called later
      } catch (error) {
        console.error('Error filling field:', error);
        continue;
      }
    }
  }
  
  console.log('Could not find field with any of the selectors:', selectors);
  if (callback) callback(false);
}

function detectPlayConsoleFields() {
  const fields = {
    appName: [],
    shortDescription: [],
    detailedDescription: [],
    allInputs: [],
    allTextareas: []
  };
  
  // Detect all input fields
  document.querySelectorAll('input[type="text"], input:not([type])').forEach(input => {
    const info = {
      tag: input.tagName,
      type: input.type,
      placeholder: input.placeholder,
      id: input.id,
      name: input.name,
      ariaLabel: input.getAttribute('aria-label'),
      dataTestId: input.getAttribute('data-test-id')
    };
    fields.allInputs.push(info);
    
    // Try to categorize
    const text = (input.placeholder + ' ' + input.id + ' ' + input.name + ' ' + (input.getAttribute('aria-label') || '')).toLowerCase();
    if (text.includes('app') && text.includes('name')) {
      fields.appName.push(info);
    }
    if (text.includes('short') || text.includes('brief')) {
      fields.shortDescription.push(info);
    }
  });
  
  // Detect all textarea fields
  document.querySelectorAll('textarea').forEach(textarea => {
    const info = {
      tag: textarea.tagName,
      placeholder: textarea.placeholder,
      id: textarea.id,
      name: textarea.name,
      rows: textarea.rows,
      ariaLabel: textarea.getAttribute('aria-label'),
      dataTestId: textarea.getAttribute('data-test-id')
    };
    fields.allTextareas.push(info);
    
    // Try to categorize
    const text = (textarea.placeholder + ' ' + textarea.id + ' ' + textarea.name + ' ' + (textarea.getAttribute('aria-label') || '')).toLowerCase();
    if (text.includes('short') || text.includes('brief')) {
      fields.shortDescription.push(info);
    }
    if (text.includes('full') || text.includes('detail') || text.includes('long') || textarea.rows >= 8) {
      fields.detailedDescription.push(info);
    }
  });
  
  // Detect contenteditable divs
  document.querySelectorAll('div[contenteditable="true"]').forEach(div => {
    const info = {
      tag: div.tagName,
      contentEditable: div.contentEditable,
      id: div.id,
      ariaLabel: div.getAttribute('aria-label'),
      dataTestId: div.getAttribute('data-test-id')
    };
    fields.detailedDescription.push(info);
  });
  
  return fields;
}

function uploadAppIcon(iconBlob, fileName) {
  console.log('Attempting to upload app icon:', fileName);
  console.log('Icon blob size:', iconBlob.size, 'bytes');
  
  // First, try to click the "入れ替え" (replace) button to open file dialog
  const replaceButtons = [
    'button[debug-id="add-more-button"]',
    'button:contains("入れ替え")',
    '.uploaded-button',
    'button.uploaded-button'
  ];
  
  let replaceButtonFound = false;
  for (const selector of replaceButtons) {
    const btn = document.querySelector(selector);
    if (btn && btn.textContent.includes('入れ替え')) {
      console.log('Found replace button, clicking:', btn);
      btn.click();
      replaceButtonFound = true;
      
      // Wait a moment for the file dialog to potentially open
      setTimeout(() => {
        tryDirectFileUpload(iconBlob, fileName);
      }, 1000);
      break;
    }
  }
  
  if (!replaceButtonFound) {
    console.log('No replace button found, trying direct file upload');
    tryDirectFileUpload(iconBlob, fileName);
  }
  
  return true;
}

function tryDirectFileUpload(iconBlob, fileName) {
  console.log('=== Starting Direct File Upload Debug ===');
  console.log('Blob details:', {
    size: iconBlob.size,
    type: iconBlob.type,
    fileName: fileName
  });
  
  // Try to find the icon upload area
  const iconSelectors = [
    // Google Play Console icon upload selectors - more specific first
    'localized-image-uploader[debug-id="icon-uploader"] input[type="file"]',
    'assets-holder .icon-uploader input[type="file"]',
    '[debug-id="icon-uploader"] input[type="file"]',
    '[debug-id="outer-container"] input[type="file"]',
    
    // Material Design file input
    'material-input input[type="file"]',
    
    // More generic selectors
    'input[type="file"][accept*="image"]',
    'input[type="file"][accept*=".png"]',
    'input[type="file"][accept*=".jpg"]',
    'assets-holder input[type="file"]',
    'localized-image-uploader input[type="file"]',
    '.icon-uploader input[type="file"]',
    'assets-holder .container input[type="file"]',
    
    // Generic file inputs that might be for icons
    'input[type="file"]'
  ];
  
  console.log('Searching for file inputs...');
  const allFileInputs = document.querySelectorAll('input[type="file"]');
  console.log('Found file inputs:', allFileInputs.length);
  
  for (let i = 0; i < allFileInputs.length; i++) {
    console.log(`File input ${i}:`, allFileInputs[i]);
  }
  
  for (const selector of iconSelectors) {
    const fileInput = document.querySelector(selector);
    if (fileInput) {
      console.log(`Found file input with selector: ${selector}`, fileInput);
      console.log('File input accept:', fileInput.accept);
      console.log('File input multiple:', fileInput.multiple);
      console.log('File input style:', fileInput.style.display);
      
      try {
        // Create a File object from the blob
        const file = new File([iconBlob], fileName, { type: 'image/png' });
        console.log('Created file object:', file);
        
        // Method 1: Try with DataTransfer
        try {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          
          // Debug: Log DataTransfer details
          console.log('DataTransfer created:', {
            files: dataTransfer.files,
            items: dataTransfer.items.length
          });
          
          fileInput.files = dataTransfer.files;
          console.log('Set files via DataTransfer successfully');
          console.log('FileInput.files after setting:', fileInput.files, 'Length:', fileInput.files.length);
          
          // Verify the file was set correctly
          if (fileInput.files.length > 0) {
            console.log('File verification:', {
              name: fileInput.files[0].name,
              type: fileInput.files[0].type,
              size: fileInput.files[0].size
            });
          }
        } catch (dtError) {
          console.error('DataTransfer method failed:', dtError);
          
          // Fallback: Try to trigger file selection dialog
          console.log('Attempting to trigger file dialog...');
          fileInput.click();
          return true;
        }
        
        // Focus the input first
        fileInput.focus();
        
        // Trigger comprehensive events
        const events = [
          new Event('focus', { bubbles: true }),
          new Event('change', { bubbles: true }),
          new Event('input', { bubbles: true }),
          new Event('blur', { bubbles: true })
        ];
        
        events.forEach(event => {
          fileInput.dispatchEvent(event);
          console.log('Dispatched event:', event.type);
        });
        
        // Angular specific events
        fileInput.dispatchEvent(new CustomEvent('change', { 
          bubbles: true, 
          detail: { files: [file] } 
        }));
        
        console.log('File set and events triggered');
        console.log('File input files after setting:', fileInput.files);
        
        // Wait and try to find submit/upload buttons
        setTimeout(() => {
          console.log('=== Looking for upload/submit buttons ===');
          
          // Look for any buttons that might trigger upload
          const allButtons = document.querySelectorAll('button');
          console.log('Total buttons on page:', allButtons.length);
          
          let uploadButtons = [];
          allButtons.forEach((btn, index) => {
            const text = btn.textContent.toLowerCase().trim();
            const className = btn.className || '';
            const debugId = btn.getAttribute('debug-id') || '';
            
            if (text.includes('upload') || text.includes('submit') || text.includes('保存') || 
                text.includes('送信') || text.includes('save') || text.includes('confirm') ||
                className.includes('upload') || debugId.includes('upload')) {
              console.log(`Upload button candidate ${index}:`, {
                element: btn,
                text: text,
                className: className,
                debugId: debugId
              });
              uploadButtons.push(btn);
            }
          });
          
          console.log('Found upload button candidates:', uploadButtons.length);
          
          // Try clicking the most likely upload button
          if (uploadButtons.length > 0) {
            console.log('Clicking first upload button:', uploadButtons[0]);
            uploadButtons[0].click();
          } else {
            // No specific upload button found, try form submission
            const forms = document.querySelectorAll('form');
            console.log('Found forms:', forms.length);
            if (forms.length > 0) {
              console.log('Attempting to submit first form');
              forms[0].submit();
            }
          }
        }, 1500); // Increased delay to allow for file processing
        
        return true;
      } catch (error) {
        console.error('Error setting file:', error);
        continue;
      }
    }
  }
  
  console.log('Could not find suitable file input for icon upload');
  
  // Last resort: try to trigger file dialog manually
  console.log('Trying to trigger replace button...');
  const replaceBtn = document.querySelector('button.uploaded-button, [debug-id="add-more-button"]');
  if (replaceBtn) {
    console.log('Triggering replace button click:', replaceBtn);
    replaceBtn.click();
  }
  
  return false;
}

function debugCurrentPage() {
  console.log('=== Play Console Debug Info ===');
  console.log('Current URL:', window.location.href);
  console.log('Page title:', document.title);
  
  // Find all textareas
  const textareas = document.querySelectorAll('textarea');
  console.log('Found textareas:', textareas.length);
  textareas.forEach((textarea, index) => {
    console.log(`Textarea ${index + 1}:`, {
      element: textarea,
      placeholder: textarea.placeholder,
      ariaLabel: textarea.getAttribute('aria-label'),
      id: textarea.id,
      name: textarea.name,
      value: textarea.value,
      rows: textarea.rows,
      cols: textarea.cols
    });
  });
  
  // Find all text inputs
  const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
  console.log('Found text inputs:', inputs.length);
  inputs.forEach((input, index) => {
    console.log(`Input ${index + 1}:`, {
      element: input,
      placeholder: input.placeholder,
      ariaLabel: input.getAttribute('aria-label'),
      id: input.id,
      name: input.name,
      value: input.value,
      type: input.type
    });
  });
  
  // Look for specific text patterns
  const allText = document.body.innerText;
  console.log('Page contains "アプリ名":', allText.includes('アプリ名'));
  console.log('Page contains "簡単な説明":', allText.includes('簡単な説明'));
  console.log('Page contains "詳しい説明":', allText.includes('詳しい説明'));
}

function showTemporaryOverlay(text) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    z-index: 10001;
    max-width: 500px;
    text-align: center;
  `;
  
  overlay.textContent = text;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 3000);
}

// Add some passive monitoring
let extensionActive = true;

// Monitor page changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Page navigation detected:', url);
  }
}).observe(document, { subtree: true, childList: true });

// Send installation confirmation to background script
chrome.runtime.sendMessage({ 
  action: 'contentScriptLoaded',
  url: window.location.href,
  timestamp: Date.now()
});