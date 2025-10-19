// Popup script - handles the Play Console auto-fill interface
document.addEventListener('DOMContentLoaded', function() {
  // Quick initialization - get only essential elements first
  const statusDiv = document.getElementById('status');
  
  // Lazy load other elements when needed
  let elementsLoaded = false;
  let appNameInput, shortDescInput, detailedDescInput, fileImportInput, loadFromFileBtn;
  let fillAllFieldsBtn, debugPageBtn, previewSection, previewContent;
  let iconImportInput, loadIconFromZipBtn, iconPreview, iconImage, iconInfo, downloadIconBtn, iconStatusDiv;
  
  function loadElements() {
    if (elementsLoaded) return;
    
    appNameInput = document.getElementById('appName');
    shortDescInput = document.getElementById('shortDesc');
    detailedDescInput = document.getElementById('detailedDesc');
    fileImportInput = document.getElementById('fileImport');
    loadFromFileBtn = document.getElementById('loadFromFile');
    fillAllFieldsBtn = document.getElementById('fillAllFields');
    debugPageBtn = document.getElementById('debugPage');
    previewSection = document.getElementById('previewSection');
    previewContent = document.getElementById('previewContent');
    
    iconImportInput = document.getElementById('iconImport');
    loadIconFromZipBtn = document.getElementById('loadIconFromZip');
    iconPreview = document.getElementById('iconPreview');
    iconImage = document.getElementById('iconImage');
    iconInfo = document.getElementById('iconInfo');
    downloadIconBtn = document.getElementById('downloadIcon');
    iconStatusDiv = document.getElementById('iconStatus');
    
    // Initialize with empty values
    appNameInput.value = '';
    shortDescInput.value = '';
    detailedDescInput.value = '';
    
    elementsLoaded = true;
  }
  
  // Event listeners - lazy load and attach
  function attachEventListeners() {
    loadElements();
    
    loadFromFileBtn.addEventListener('click', loadFromFile);
    fillAllFieldsBtn.addEventListener('click', fillAllFields);
    debugPageBtn.addEventListener('click', debugPage);
    fileImportInput.addEventListener('change', handleFileSelection);
    
    // Icon import event listeners
    loadIconFromZipBtn.addEventListener('click', loadIconFromZip);
    iconImportInput.addEventListener('change', handleIconFileSelection);
    downloadIconBtn.addEventListener('click', downloadProcessedIcon);
  }
  
  // Attach listeners on first interaction
  document.addEventListener('click', function() {
    attachEventListeners();
  }, { once: true });
  
  function handleFileSelection() {
    const file = fileImportInput.files[0];
    if (file) {
      showStatus(`Selected: ${file.name}`, 'success');
    }
  }
  
  function loadFromFile() {
    const file = fileImportInput.files[0];
    if (!file) {
      showStatus('Please select a file first', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        let data;
        const fileContent = e.target.result;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(fileContent);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(fileContent);
        } else {
          // Plain text - assume it's structured data
          data = parseTextFile(fileContent);
        }
        
        // Populate fields with imported data
        if (data.appName) appNameInput.value = data.appName;
        if (data.shortDescription) shortDescInput.value = data.shortDescription;
        if (data.detailedDescription) detailedDescInput.value = data.detailedDescription;
        
        // Show preview
        showPreview(data);
        
        showStatus('File loaded successfully!', 'success');
      } catch (error) {
        showStatus('Error reading file: ' + error.message, 'error');
      }
    };
    
    reader.readAsText(file);
  }
  
  function parseCSV(content) {
    const data = {};
    let currentKey = '';
    let currentValue = '';
    let insideQuotes = false;
    let lines = content.split('\n');
    
    console.log('Parsing CSV with', lines.length, 'lines');
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip completely empty lines at the beginning
      if (!line.trim() && !currentKey && !insideQuotes) continue;
      
      // If we're not currently parsing a multi-line value
      if (!insideQuotes && line.includes(',')) {
        // Save previous key-value if exists
        if (currentKey && currentValue !== '') {
          console.log('Saving:', currentKey, '=', currentValue.substring(0, 50) + '...');
          assignValue(data, currentKey, currentValue.trim());
          currentValue = '';
        }
        
        const commaIndex = line.indexOf(',');
        currentKey = line.substring(0, commaIndex).trim();
        let value = line.substring(commaIndex + 1).trim();
        
        console.log('New key:', currentKey, 'value start:', value.substring(0, 30));
        
        // Check if value starts with quote
        if (value.startsWith('"')) {
          value = value.substring(1); // Remove opening quote
          insideQuotes = true;
          
          // Check if the line also ends with quote (single line quoted value)
          if (value.endsWith('"') && value.length > 0) {
            currentValue = value.substring(0, value.length - 1); // Remove closing quote
            insideQuotes = false;
            console.log('Single line quoted value:', currentKey, '=', currentValue);
            assignValue(data, currentKey, currentValue.trim());
            currentKey = '';
            currentValue = '';
          } else {
            currentValue = value;
            console.log('Starting multi-line quoted value for:', currentKey);
          }
        } else {
          // Not quoted, simple value
          currentValue = value;
          console.log('Simple value:', currentKey, '=', currentValue);
          assignValue(data, currentKey, currentValue.trim());
          currentKey = '';
          currentValue = '';
        }
      } else if (insideQuotes) {
        // We're inside a multi-line quoted value
        if (line.endsWith('"')) {
          // End of quoted value
          if (currentValue) {
            currentValue += '\n' + line.substring(0, line.length - 1);
          } else {
            currentValue = line.substring(0, line.length - 1);
          }
          insideQuotes = false;
          console.log('Completed multi-line value for:', currentKey, 'length:', currentValue.length);
          assignValue(data, currentKey, currentValue.trim());
          currentKey = '';
          currentValue = '';
        } else {
          // Continue multi-line value
          if (currentValue) {
            currentValue += '\n' + line;
          } else {
            currentValue = line;
          }
        }
      }
    }
    
    // Handle any remaining key-value pair
    if (currentKey && currentValue !== '') {
      console.log('Final save:', currentKey, '=', currentValue.substring(0, 50) + '...');
      assignValue(data, currentKey, currentValue.trim());
    }
    
    console.log('Parsed data:', data);
    return data;
  }
  
  function assignValue(data, key, value) {
    console.log('Assigning key:', `"${key}"`, 'value:', `"${value?.substring(0, 50)}..."`);
    
    // First check for fields to skip (more specific patterns first)
    if (key.includes('iOS App Store評価概要のリセット') || 
        key.includes('評価概要のリセット') ||
        key.includes('リセット')) {
      console.log('Skipping iOS App Store評価概要のリセット field');
      return;
    } else if (key.includes('公開方法')) {
      console.log('Skipping 公開方法 field');
      return;
    } else if (key.includes('このバージョンの最新情報')) {
      console.log('Skipping このバージョンの最新情報 field');
      return;
    } else if (key.includes('サブタイトル')) {
      console.log('Skipping サブタイトル field');
      return;
    } else if (key.includes('アプリの配信国')) {
      console.log('Skipping アプリの配信国 field');
      return;
    } else if (key.includes('その他特記事項')) {
      console.log('Skipping その他特記事項 field');
      return;
    } else if (key.includes('キーワード')) {
      console.log('Skipping キーワード field');
      return;
    } else if (key.includes('サポートURL')) {
      console.log('Skipping サポートURL field');
      return;
    } else if (key.includes('マーケティングURL')) {
      console.log('Skipping マーケティングURL field');
      return;
    } else if (key.includes('著作権')) {
      console.log('Skipping 著作権 field');
      return;
    } else if (key.includes('サインイン情報')) {
      console.log('Skipping サインイン情報 field');
      return;
    } else if (key.includes('連絡先情報')) {
      console.log('Skipping 連絡先情報 field');
      return;
    } else if (key.includes('メモ')) {
      console.log('Skipping メモ field');
      return;
    }
    
    // Now assign the fields we want
    if (key.includes('アプリ名') && !key.includes('サブ')) {
      console.log('✅ Assigning to appName:', value);
      data.appName = value;
    } else if (key.includes('プロモーション用テキスト')) {
      console.log('✅ Assigning to shortDescription (promo):', value);
      data.shortDescription = value;
    } else if (key === '概要' || key.trim() === '概要' || key.includes('概要')) {
      console.log('✅ Assigning to detailedDescription (概要):', value);
      data.detailedDescription = value;
    } else if (key.includes('簡単な説明')) {
      console.log('✅ Assigning to shortDescription:', value);
      data.shortDescription = value;
    } else if (key.includes('詳しい説明')) {
      console.log('✅ Assigning to detailedDescription:', value);
      data.detailedDescription = value;
    } else {
      console.log('❌ Unmatched key, ignoring:', `"${key}"`);
    }
  }
  
  function parseTextFile(content) {
    const lines = content.split('\n');
    const data = {};
    
    lines.forEach(line => {
      if (line.includes('アプリ名') || line.includes('App Name')) {
        data.appName = line.split(/[:：]/)[1]?.trim();
      } else if (line.includes('簡単な説明') || line.includes('Short Description')) {
        data.shortDescription = line.split(/[:：]/)[1]?.trim();
      } else if (line.includes('詳しい説明') || line.includes('Detailed Description')) {
        data.detailedDescription = line.split(/[:：]/)[1]?.trim();
      }
    });
    
    return data;
  }
  
  function showPreview(data) {
    let previewHtml = '';
    
    if (data.appName) {
      previewHtml += `<div style="margin-bottom: 8px;"><strong>App Name:</strong> ${data.appName}</div>`;
    }
    if (data.shortDescription) {
      previewHtml += `<div style="margin-bottom: 8px;"><strong>Short Description:</strong> ${data.shortDescription.substring(0, 100)}${data.shortDescription.length > 100 ? '...' : ''}</div>`;
    }
    if (data.detailedDescription) {
      const preview = data.detailedDescription.substring(0, 200).replace(/\n/g, ' ');
      previewHtml += `<div style="margin-bottom: 8px;"><strong>Detailed Description:</strong> ${preview}${data.detailedDescription.length > 200 ? '...' : ''}</div>`;
    }
    if (data.category) {
      previewHtml += `<div style="margin-bottom: 4px;"><strong>Category:</strong> ${data.category}</div>`;
    }
    if (data.tags) {
      previewHtml += `<div style="margin-bottom: 4px;"><strong>Tags:</strong> ${data.tags}</div>`;
    }
    if (data.supportEmail) {
      previewHtml += `<div style="margin-bottom: 4px;"><strong>Support Email:</strong> ${data.supportEmail}</div>`;
    }
    if (data.companyName) {
      previewHtml += `<div style="margin-bottom: 4px;"><strong>Company:</strong> ${data.companyName}</div>`;
    }
    
    if (previewHtml) {
      previewContent.innerHTML = previewHtml;
      previewSection.style.display = 'block';
    }
  }
  
  
  function fillAllFields() {
    const appName = appNameInput.value.trim();
    const shortDesc = shortDescInput.value.trim();
    const detailedDesc = detailedDescInput.value.trim();
    
    if (!appName || !shortDesc || !detailedDesc) {
      showStatus('Please fill in all fields', 'error');
      return;
    }
    
    // Fill all fields in sequence
    let completed = 0;
    let errors = 0;
    const totalFields = 3;
    
    function checkCompletion() {
      completed++;
      if (completed === totalFields) {
        if (errors === 0) {
          showStatus('🚀 All fields filled successfully!', 'success');
        } else {
          showStatus(`Filled ${totalFields - errors}/${totalFields} fields successfully`, 'error');
        }
      }
    }
    
    // Fill app name
    sendMessageToActiveTab('fillAppName', { appName }, function(response) {
      console.log('App name response:', response);
      if (!response?.success) {
        console.error('Failed to fill app name:', response?.message || response?.error || 'Unknown error');
        errors++;
      }
      checkCompletion();
    });
    
    // Fill short description
    sendMessageToActiveTab('fillShortDescription', { description: shortDesc }, function(response) {
      console.log('Short description response:', response);
      if (!response?.success) {
        console.error('Failed to fill short description:', response?.message || response?.error || 'Unknown error');
        errors++;
      }
      checkCompletion();
    });
    
    // Fill detailed description
    sendMessageToActiveTab('fillDetailedDescription', { description: detailedDesc }, function(response) {
      console.log('Detailed description response:', response);
      if (!response?.success) {
        console.error('Failed to fill detailed description:', response?.message || response?.error || 'Unknown error');
        errors++;
      }
      checkCompletion();
    });
  }
  
  function debugPage() {
    sendMessageToActiveTab('debugCurrentPage', {}, function(response) {
      if (response && response.success) {
        showStatus('Debug info logged to console - Open Developer Tools (F12)', 'success');
      } else {
        showStatus('Failed to debug page', 'error');
      }
    });
  }
  
  function sendMessageToActiveTab(action, data, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length === 0) {
        callback({ error: 'No active tab found' });
        return;
      }
      
      // Check if we're on Play Console
      const tab = tabs[0];
      if (!tab.url.includes('play.google.com/console')) {
        showStatus('Please navigate to Google Play Console first', 'error');
        return;
      }
      
      const message = { action, ...data };
      chrome.tabs.sendMessage(tab.id, message, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          callback({ error: chrome.runtime.lastError.message });
        } else {
          callback(response);
        }
      });
    });
  }
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Clear status after 5 seconds
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 5000);
  }
  
  // Icon upload functions
  function handleIconFileSelection() {
    loadElements();
    const file = iconImportInput.files[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        showIconStatus(`Selected ZIP: ${file.name}`, 'success');
      } else {
        showIconStatus('Please select a ZIP file', 'error');
        iconImportInput.value = '';
      }
    }
  }
  
  function loadIconFromZip() {
    loadElements();
    const file = iconImportInput.files[0];
    if (!file) {
      showIconStatus('Please select a ZIP file first', 'error');
      return;
    }
    
    if (!file.name.endsWith('.zip')) {
      showIconStatus('Please select a ZIP file', 'error');
      return;
    }
    
    // Check if JSZip is available
    if (typeof JSZip === 'undefined') {
      showIconStatus('❌ ZIP processor not available. Please reload the extension.', 'error');
      return;
    }
    
    showIconStatus('Extracting icon from ZIP...', 'success');
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        JSZip.loadAsync(e.target.result).then(function(zip) {
          // Look for icon.png file
          const iconFile = zip.files['icon.png'] || zip.files['Icon.png'] || zip.files['ICON.PNG'];
          
          if (!iconFile) {
            // Look for any PNG file in the ZIP
            const pngFiles = Object.keys(zip.files).filter(name => 
              name.toLowerCase().endsWith('.png') && !zip.files[name].dir
            );
            
            if (pngFiles.length === 0) {
              showIconStatus('No PNG files found in ZIP', 'error');
              return;
            }
            
            // Use the first PNG file found
            const firstPng = zip.files[pngFiles[0]];
            extractAndUploadIcon(firstPng, pngFiles[0]);
          } else {
            extractAndUploadIcon(iconFile, 'icon.png');
          }
        }).catch(function(error) {
          showIconStatus('Error reading ZIP file: ' + error.message, 'error');
        });
      } catch (error) {
        showIconStatus('Error processing ZIP: ' + error.message, 'error');
      }
    };
    
    reader.readAsArrayBuffer(file);
  }
  
  function extractAndUploadIcon(iconFile, fileName) {
    iconFile.async('blob').then(function(blob) {
      // Validate image size and format - Google Play Console allows up to 1MB but let's be more lenient
      if (blob.size > 2 * 1024 * 1024) { // 2MB limit to be safe
        showIconStatus(`Icon file is too large (${Math.round(blob.size / 1024 / 1024 * 100) / 100}MB, max 2MB)`, 'error');
        return;
      }
      
      // Clean filename - remove path separators
      const cleanFileName = fileName.replace(/.*[\/\\]/, '');
      console.log(`Original filename: ${fileName}, Clean filename: ${cleanFileName}`);
      
      // Show file size info
      const sizeKB = Math.round(blob.size / 1024);
      const sizeMB = Math.round(blob.size / 1024 / 1024 * 100) / 100;
      console.log(`Icon file size: ${sizeKB}KB (${sizeMB}MB)`);
      
      // Create preview
      const url = URL.createObjectURL(blob);
      iconImage.src = url;
      const displaySize = blob.size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`;
      iconInfo.textContent = `${fileName} (${displaySize})`;
      iconPreview.style.display = 'block';
      
      // Validate image dimensions
      iconImage.onload = function() {
        const isCorrectSize = iconImage.naturalWidth === 512 && iconImage.naturalHeight === 512;
        const sizeOkForPlayConsole = blob.size <= 1024 * 1024;
        
        if (!isCorrectSize || !sizeOkForPlayConsole) {
          // Show resize/compress option
          const needsResize = !isCorrectSize;
          const needsCompress = !sizeOkForPlayConsole;
          
          showIconStatus(`Image needs processing: ${iconImage.naturalWidth}x${iconImage.naturalHeight}, ${displaySize}. Click to auto-fix.`, 'error');
          
          // Store original blob for processing
          iconImage.originalBlob = blob;
          iconImage.iconFileName = fileName;
          
          // Add click handler to process and upload
          iconImage.onclick = function() {
            processAndUploadIcon(blob, cleanFileName, needsResize, needsCompress);
          };
          iconImage.style.cursor = 'pointer';
          iconImage.title = 'Click to resize to 512x512 and compress, then upload';
        } else {
          showIconStatus('Icon extracted successfully! Click to upload to Play Console.', 'success');
          
          // Store the blob for upload
          iconImage.iconBlob = blob;
          iconImage.iconFileName = fileName;
          
          // Add click handler to upload directly
          iconImage.onclick = function() {
            uploadIconToPlayConsole(blob, cleanFileName);
          };
          iconImage.style.cursor = 'pointer';
          iconImage.title = 'Click to upload to Play Console';
        }
      };
      
    }).catch(function(error) {
      showIconStatus('Error extracting icon: ' + error.message, 'error');
    });
  }
  
  function processAndUploadIcon(blob, fileName, needsResize, needsCompress) {
    showIconStatus('Processing image (resize & compress)...', 'success');
    
    // Clean filename - remove path separators  
    const cleanFileName = fileName.replace(/.*[\/\\]/, '');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Set canvas to 512x512 (Google Play Console requirement)
      canvas.width = 512;
      canvas.height = 512;
      
      // Draw image resized to fit 512x512 (crop to square if needed)
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      ctx.drawImage(img, x, y, size, size, 0, 0, 512, 512);
      
      // Convert to blob with proper PNG format
      canvas.toBlob(function(processedBlob) {
        if (!processedBlob) {
          showIconStatus('Error processing image', 'error');
          return;
        }
        
        // Verify it's a valid PNG
        if (!processedBlob.type || !processedBlob.type.includes('png')) {
          showIconStatus('Error: Failed to create valid PNG format', 'error');
          return;
        }
        
        const newSizeKB = Math.round(processedBlob.size / 1024);
        const newSizeMB = Math.round(processedBlob.size / 1024 / 1024 * 100) / 100;
        const newDisplaySize = processedBlob.size > 1024 * 1024 ? `${newSizeMB}MB` : `${newSizeKB}KB`;
        
        // Update preview with processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        iconImage.src = processedUrl;
        iconInfo.textContent = `${fileName} - Processed (512x512, ${newDisplaySize})`;
        
        if (processedBlob.size <= 1024 * 1024) {
          showIconStatus(`✅ Image processed successfully! (512x512, ${newDisplaySize})\n📤 Click image to upload to Play Console\n💾 Or use download button for manual upload`, 'success');
        } else {
          showIconStatus(`⚠️ Image resized but still large (${newDisplaySize})\n📤 Click image to try upload\n💾 Or use download button for manual upload`, 'error');
        }
        
        // Show download button
        downloadIconBtn.style.display = 'block';
        downloadIconBtn.processedBlob = processedBlob;
        downloadIconBtn.fileName = cleanFileName.replace(/\.[^.]+$/, '-512x512.png');
        
        // Update click handler for upload
        iconImage.onclick = function() {
          showIconStatus('⏳ Uploading to Play Console...', 'success');
          uploadIconToPlayConsole(processedBlob, cleanFileName.replace(/\.[^.]+$/, '-512x512.png'));
        };
        iconImage.title = 'Click to upload processed icon to Play Console';
        
      }, 'image/png', 0.9); // 90% quality for better compatibility
    };
    
    img.src = URL.createObjectURL(blob);
  }
  
  function uploadIconToPlayConsole(blob, fileName) {
    showIconStatus('⏳ Uploading icon to Play Console...', 'success');
    
    // Ensure proper PNG filename
    const properFileName = fileName.endsWith('.png') ? fileName : fileName.replace(/\.[^.]+$/, '.png');
    
    // Create File object with proper MIME type
    const file = new File([blob], properFileName, { 
      type: 'image/png',
      lastModified: Date.now()
    });
    
    // Log file details for debugging
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    sendMessageToActiveTab('uploadIcon', { 
      iconData: blob,
      fileName: properFileName,
      fileType: 'image/png'
    }, function(response) {
      if (response && response.success) {
        showIconStatus('✅ Icon uploaded successfully to Play Console!', 'success');
      } else {
        const errorMsg = response?.message || 'Unknown error';
        showIconStatus(`❌ Upload failed: ${errorMsg}\n\n💡 Common solutions:\n• Use the download button for manual upload\n• Ensure the image is exactly 512x512px\n• File must be under 1MB\n• Only PNG/JPEG formats accepted`, 'error');
      }
    });
  }
  
  function showIconStatus(message, type) {
    loadElements();
    iconStatusDiv.textContent = message;
    iconStatusDiv.className = `icon-status ${type}`;
    iconStatusDiv.style.display = 'block';
    
    // Icons status messages do NOT auto-clear (persistent)
  }
  
  function downloadProcessedIcon() {
    if (downloadIconBtn.processedBlob) {
      const url = URL.createObjectURL(downloadIconBtn.processedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadIconBtn.fileName || 'icon-512x512.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showIconStatus('💾 Icon downloaded! Now manually upload to Play Console', 'success');
    }
  }
});