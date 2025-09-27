import { chromium } from "playwright";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".envrc" });

async function simpleManualLogin() {
  console.log("=== 自動ログイン + 自動化 ===");
  console.log("Email/Passwordは自動入力、2段階認証のみ手動です");
  
  // Check environment variables
  const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
  const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
  
  if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
    console.error("❌ Error: GOOGLE_EMAIL and GOOGLE_PASSWORD must be set in .envrc");
    console.log("Please set your credentials in .envrc file:");
    console.log('export GOOGLE_EMAIL="your-email@gmail.com"');
    console.log('export GOOGLE_PASSWORD="your-password"');
    process.exit(1);
  }
  
  console.log(`📧 Email: ${GOOGLE_EMAIL}`);
  console.log(`🔒 Password: ${'*'.repeat(GOOGLE_PASSWORD.length)}`);
  
  try {
    // Launch browser without session persistence
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--exclude-switches=enable-automation',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
    });

    const page = await context.newPage();

    // Hide automation indicators
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    console.log("🌐 ブラウザを起動しました");
    console.log("📱 Google Play Console にアクセス中...");
    
    // Navigate directly to the target URL
    const targetUrl = "https://play.google.com/console/u/0/developers/7717290397189101849/app-list";
    await page.goto(targetUrl);
    await page.waitForLoadState("networkidle");
    
    let currentUrl = page.url();
    console.log("現在のURL:", currentUrl);
    
    if (currentUrl.includes("accounts.google.com")) {
      console.log("📝 Googleログインページを検出しました。自動ログインを開始...");
      
      // Step 1: Enter email
      console.log("1️⃣ Emailを入力中...");
      const emailInput = await page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill(GOOGLE_EMAIL);
        await page.click('button:has-text("Next"), #identifierNext');
        await page.waitForLoadState("networkidle");
        console.log("✅ Email入力完了");
      } else {
        console.log("❌ Emailフィールドが見つかりません");
      }
      
      // Step 2: Enter password
      console.log("2️⃣ Passwordを入力中...");
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      const passwordInput = await page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(GOOGLE_PASSWORD);
        await page.click('button:has-text("Next"), #passwordNext');
        await page.waitForLoadState("networkidle");
        console.log("✅ Password入力完了");
      } else {
        console.log("❌ Passwordフィールドが見つかりません");
      }
      
      // Step 3: Handle 2FA if required
      currentUrl = page.url();
      if (currentUrl.includes("accounts.google.com")) {
        console.log("3️⃣ 2段階認証が必要な可能性があります");
        
        // Check for 2FA input
        const twoFactorSelectors = [
          'input[type="tel"]',
          'input[aria-label*="code"]',
          'input[placeholder*="code"]',
          'input[name*="totpPin"]'
        ];
        
        let twoFactorFound = false;
        for (const selector of twoFactorSelectors) {
          try {
            const totpInput = await page.locator(selector).first();
            if (await totpInput.isVisible()) {
              console.log("📱 2段階認証コード入力フィールドを発見しました");
              console.log("🔢 スマートフォンまたは認証アプリでコードを確認し、手動で入力してください");
              console.log("📝 コード入力後、Enterキーを押してください...");
              twoFactorFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (!twoFactorFound) {
          console.log("🤔 2段階認証フィールドが見つかりませんが、まだログインページにいます");
          console.log("📝 必要な認証を手動で完了し、Play Consoleが表示されたらEnterキーを押してください...");
        }
        
        // Wait for manual 2FA completion
        await new Promise((resolve) => {
          process.stdin.once('data', () => resolve());
        });
      }
      
      // Check login result
      currentUrl = page.url();
      console.log("認証後URL:", currentUrl);
    }
    
    if (currentUrl.includes("/console/about")) {
      console.log("⚠️ Developer Program登録ページです。");
      console.log("正しい開発者アカウントでログインしてください。");
      console.log("解決したらEnterキーを押してください...");
      
      await new Promise((resolve) => {
        process.stdin.once('data', () => resolve());
      });
      currentUrl = page.url();
    }
    
    if (!currentUrl.includes("play.google.com/console") || currentUrl.includes("accounts.google.com")) {
      console.log("❌ ログインに失敗したようです。手動で解決してください。");
      console.log("解決したらEnterキーを押してください...");
      
      await new Promise((resolve) => {
        process.stdin.once('data', () => resolve());
      });
    }
    
    console.log("✅ Google Play Consoleにアクセス成功!");
    
    // Navigate to app list if not already there
    if (!currentUrl.includes("app-list")) {
      console.log("📱 アプリリストに移動中...");
      await page.goto(targetUrl);
      await page.waitForLoadState("networkidle");
    }
    
    console.log("🚀 自動化ワークフローを開始します");
    console.log("準備ができたらEnterキーを押してください...");
    
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve());
    });
    
    // Try to get app ID and go directly to store listing
    const appId = await getFirstAppId(page);
    if (appId) {
      console.log("📱 アプリIDを取得しました:", appId);
      console.log("🔄 直接ストア掲載情報ページに移動中...");
      
      const developerId = "7717290397189101849";
      const directUrl = `https://play.google.com/console/u/0/developers/${developerId}/app/${appId}/main-store-listing`;
      
      await page.goto(directUrl);
      await page.waitForLoadState("networkidle");
      
      console.log("✅ ストア掲載情報ページに直接アクセスしました");
      
      // Execute simplified workflow (skip navigation steps)
      await performSimplifiedWorkflow(page);
    } else {
      console.log("⚠️ アプリIDが取得できませんでした。通常のワークフローを実行します。");
      // Execute the complete workflow
      await performCompleteWorkflow(page);
    }
    
    console.log("\n✅ すべてのタスクが完了しました！");
    console.log("ブラウザを閉じる場合はCtrl+Cを押してください。");
    
    // Keep browser open for verification
    await new Promise(() => {});
    
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

async function performCompleteWorkflow(page) {
  try {
    console.log("📋 完全ワークフローを開始...");
    
    // Take initial screenshot
    await page.screenshot({ path: "workflow-start.png" });
    console.log("📸 開始スクリーンショット: workflow-start.png");
    
    // Step 1: Click first app in list (README specification)
    console.log("\n1️⃣ アプリリストの一番上のアプリをクリック...");
    await clickFirstApp(page);
    
    // Step 2: Click ユーザーを増やす
    console.log("\n2️⃣ 'ユーザーを増やす' セクションをクリック...");
    await clickGrowUsers(page);
    
    // Step 3: Click ストアでの表示 to open accordion
    console.log("\n3️⃣ 'ストアでの表示' をクリックしてアコーディオンを開く...");
    await clickStoreDisplay(page);
    
    // Step 4: Click ストアの掲載情報 button
    console.log("\n4️⃣ 'ストアの掲載情報' ボタンをクリック...");
    await clickStoreListingButton(page);
    
    // Step 5: Click default store listing arrow
    console.log("\n5️⃣ デフォルトストア掲載情報の矢印をクリック...");
    await clickDefaultStoreArrow(page);
    
    // Step 6: Update description to 'desc'
    console.log("\n6️⃣ 簡単な説明を 'desc' に更新...");
    await updateDescription(page);
    
    // Step 7: Save changes
    console.log("\n7️⃣ 変更を保存...");
    await saveChanges(page);
    
    // Step 8: Take final screenshot
    console.log("\n8️⃣ 最終スクリーンショット撮影...");
    await page.screenshot({ path: "workflow-complete.png" });
    console.log("📸 完了スクリーンショット: workflow-complete.png");
    
  } catch (error) {
    console.error("❌ ワークフロー実行中にエラー:", error);
    throw error;
  }
}

async function clickFirstApp(page) {
  console.log("🔍 アプリリストの一番上の行を探しています...");
  
  // First, find the first row in the app list
  const rowSelectors = [
    'tbody tr:first-child',
    'tr:first-child',
    '.app-row:first-child',
    '.console-table tbody tr:first-child'
  ];

  for (const rowSelector of rowSelectors) {
    try {
      const firstRow = await page.locator(rowSelector).first();
      if (await firstRow.isVisible()) {
        console.log(`✅ 一番上のアプリ行を発見: ${rowSelector}`);
        
        // Look for arrow button on the right side of the row
        const arrowSelectors = [
          'button[aria-label*="表示"]',
          'button.mdc-icon-button',
          'button[type="submit"][aria-label*="表示"]',
          'button:has(i:has-text("arrow_right_alt"))',
          'button:has(material-icon)',
          'i.material-icon-i:has-text("arrow_right_alt")',
          'material-icon:has(i:has-text("arrow_right_alt"))',
          'i[class*="material-icon-i"]',
          'i[class*="material-icons-extended"]',
          'i:has-text("arrow_right_alt")',
          'material-icon i',
          '.material-icon-i',
          '.material-icons-extended',
          'button:last-child',
          '[role="button"]:last-child',
          'td:last-child button',
          'td:last-child [role="button"]'
        ];
        
        for (const arrowSelector of arrowSelectors) {
          try {
            const arrow = await firstRow.locator(arrowSelector).first();
            if (await arrow.isVisible()) {
              console.log(`✅ 行の右端の矢印ボタンを発見: ${arrowSelector}`);
              const appText = await firstRow.textContent();
              console.log(`📱 アプリ: ${appText?.trim().substring(0, 50)}...`);
              
              // Try to click the arrow itself first
              try {
                await arrow.click();
                await page.waitForLoadState("networkidle");
                return;
              } catch (clickError) {
                // If clicking the icon fails, try clicking its parent button/link
                console.log(`🔄 矢印直接クリック失敗、親要素を試行中...`);
                const clickableParent = await arrow.locator('xpath=ancestor::*[self::a or self::button or @role="button"]').first();
                if (await clickableParent.isVisible()) {
                  await clickableParent.click();
                  await page.waitForLoadState("networkidle");
                  return;
                }
              }
            }
          } catch (e) {
            // Continue to next arrow selector
          }
        }
        
        // Additional attempt: look for any clickable element in the last cell
        console.log("🔄 最後のセルの全クリック可能要素を検索中...");
        try {
          const lastCell = await firstRow.locator('td:last-child, th:last-child').first();
          if (await lastCell.isVisible()) {
            const clickableElements = await lastCell.locator('a, button, [role="button"], i, material-icon, console-icon').all();
            console.log(`🔍 最後のセルに ${clickableElements.length} 個のクリック可能要素を発見`);
            
            for (const element of clickableElements) {
              if (await element.isVisible()) {
                try {
                  console.log(`🖱️ 要素をクリック中...`);
                  await element.click();
                  await page.waitForLoadState("networkidle");
                  return;
                } catch (clickError) {
                  // Continue to next element
                }
              }
            }
          }
        } catch (e) {
          // Continue
        }
        
        // If no arrow found, try clicking the row itself
        console.log("🔄 矢印が見つからないため、行全体をクリック...");
        await firstRow.click();
        await page.waitForLoadState("networkidle");
        return;
      }
    } catch (e) {
      // Continue to next row selector
    }
  }
  
  console.log("❌ 一番上のアプリが見つかりません。");
  
  // Debug: show what elements are available
  console.log("🔍 デバッグ: ページ内の利用可能な要素を確認中...");
  try {
    const allRows = await page.locator('tr, .app-row, [class*="app"]').all();
    console.log(`📋 発見された行数: ${allRows.length}`);
    
    for (let i = 0; i < Math.min(allRows.length, 3); i++) {
      const rowText = await allRows[i].textContent();
      console.log(`\n行 ${i + 1}: ${rowText?.trim().substring(0, 100)}...`);
      
      // Check for all clickable elements in this row
      const clickableElements = await allRows[i].locator('a, button, [role="button"], i, material-icon, console-icon, [tabindex], [onclick]').all();
      console.log(`  クリック可能要素数: ${clickableElements.length}`);
      
      for (let j = 0; j < clickableElements.length; j++) {
        const element = clickableElements[j];
        const tagName = await element.evaluate(el => el.tagName);
        const classes = await element.getAttribute('class') || '';
        const text = await element.textContent() || '';
        const role = await element.getAttribute('role') || '';
        const ariaLabel = await element.getAttribute('aria-label') || '';
        
        console.log(`  要素 ${j + 1}: <${tagName.toLowerCase()}> class="${classes}" role="${role}" aria-label="${ariaLabel}" text="${text.trim()}"`);
      }
      
      // Specifically look for the rightmost elements
      console.log(`  右端の要素を確認中...`);
      const rightmostElements = await allRows[i].locator('> *:last-child, td:last-child *, th:last-child *').all();
      console.log(`  右端要素数: ${rightmostElements.length}`);
      
      for (let k = 0; k < rightmostElements.length; k++) {
        const element = rightmostElements[k];
        const tagName = await element.evaluate(el => el.tagName);
        const classes = await element.getAttribute('class') || '';
        const text = await element.textContent() || '';
        
        console.log(`    右端 ${k + 1}: <${tagName.toLowerCase()}> class="${classes}" text="${text.trim()}"`);
      }
    }
  } catch (e) {
    console.log("デバッグ情報取得エラー:", e.message);
  }
  
  await page.screenshot({ path: "step1-debug.png" });
  console.log("📸 デバッグスクリーンショット: step1-debug.png");
  console.log("手動でクリックしてEnterを押してください...");
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function clickGrowUsers(page) {
  const selectors = [
    'text="ユーザーを増やす"',
    'span:has-text("ユーザーを増やす")',
    '.item-label:has-text("ユーザーを増やす")',
    'text="Grow users"'
  ];

  for (const selector of selectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ 'ユーザーを増やす' を発見`);
        
        // Try to click parent if it's a span
        if (selector.includes('span') || selector.includes('item-label')) {
          const parent = await element.locator('xpath=ancestor::*[self::a or self::button or @role="button"]').first();
          if (await parent.isVisible()) {
            await parent.click();
          } else {
            await element.click();
          }
        } else {
          await element.click();
        }
        
        await page.waitForLoadState("networkidle");
        return;
      }
    } catch (e) {
      // Continue
    }
  }
  
  console.log("❌ 'ユーザーを増やす' が見つかりません。手動でクリックしてEnterを押してください...");
  await page.screenshot({ path: "step2-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function clickStoreDisplay(page) {
  console.log("🔍 'ストアでの表示' を探してアコーディオンを開きます...");
  
  const storeDisplaySelectors = [
    'text="ストアでの表示"',
    'text="Store display"',
    'button:has-text("ストアでの表示")',
    'a:has-text("ストアでの表示")',
    '[aria-label*="ストアでの表示"]'
  ];

  for (const selector of storeDisplaySelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ 'ストアでの表示' を発見: ${selector}`);
        await element.click();
        await page.waitForLoadState("networkidle");
        return;
      }
    } catch (e) {
      // Continue
    }
  }
  
  console.log("❌ 'ストアでの表示' が見つかりません。手動でクリックしてEnterを押してください...");
  await page.screenshot({ path: "step3-store-display-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function clickStoreListingButton(page) {
  console.log("🔍 'ストアの掲載情報' ボタンを探しています...");
  
  const storeListingSelectors = [
    'text="ストアの掲載情報"',
    'text="Store listing"',
    'button:has-text("ストアの掲載情報")',
    'a:has-text("ストアの掲載情報")',
    '[aria-label*="ストアの掲載情報"]'
  ];

  for (const selector of storeListingSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ 'ストアの掲載情報' ボタンを発見: ${selector}`);
        await element.click();
        await page.waitForLoadState("networkidle");
        return;
      }
    } catch (e) {
      // Continue
    }
  }
  
  console.log("❌ 'ストアの掲載情報' ボタンが見つかりません。手動でクリックしてEnterを押してください...");
  await page.screenshot({ path: "step4-store-listing-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function clickStartButton(page) {
  console.log("🔍 ストア掲載情報要素の右端にある始めるボタンを探しています...");
  
  // First, find the store listing section
  const storeSectionSelectors = [
    'text="ストアの掲載情報"',
    'text="Store listing"',
    '[data-test-id*="store"]',
    '.store-listing'
  ];
  
  for (const sectionSelector of storeSectionSelectors) {
    try {
      const storeSection = await page.locator(sectionSelector).first();
      if (await storeSection.isVisible()) {
        console.log(`✅ ストア掲載情報セクションを発見: ${sectionSelector}`);
        
        // Look for "始める" button on the right side of this element
        const startButtonSelectors = [
          'button:has-text("始める")',
          'a:has-text("始める")',
          '.mdc-button:has-text("始める")',
          '[aria-label*="始める"]',
          'button:last-child',
          'a:last-child'
        ];
        
        // First try within the section
        for (const buttonSelector of startButtonSelectors) {
          try {
            const startButton = await storeSection.locator(`.. ${buttonSelector}`).first();
            if (await startButton.isVisible()) {
              console.log(`✅ セクション内の始めるボタンを発見: ${buttonSelector}`);
              await startButton.click();
              await page.waitForLoadState("networkidle");
              return;
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Then try nearby elements (parent container)
        const parentContainer = storeSection.locator('xpath=ancestor::*[1]');
        for (const buttonSelector of startButtonSelectors) {
          try {
            const startButton = await parentContainer.locator(buttonSelector).first();
            if (await startButton.isVisible()) {
              console.log(`✅ 親要素内の始めるボタンを発見: ${buttonSelector}`);
              await startButton.click();
              await page.waitForLoadState("networkidle");
              return;
            }
          } catch (e) {
            // Continue
          }
        }
      }
    } catch (e) {
      // Continue to next section selector
    }
  }
  
  // Fallback: look for any "始める" button on the page
  const globalSelectors = [
    'a:has-text("始める")',
    'button:has-text("始める")',
    '.mdc-button:has-text("始める")',
    'a[aria-label*="ストアの掲載情報"]',
    'a[href*="store-listings"]'
  ];

  for (const selector of globalSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ 全体検索で始めるボタンを発見: ${selector}`);
        await element.click();
        await page.waitForLoadState("networkidle");
        return;
      }
    } catch (e) {
      // Continue
    }
  }
  
  console.log("❌ '始める' ボタンが見つかりません。手動でクリックしてEnterを押してください...");
  await page.screenshot({ path: "step3-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function clickDefaultStoreArrow(page) {
  await page.waitForTimeout(2000); // Wait for table to load
  
  console.log("🔍 'デフォルトのストアの掲載情報' 行の矢印ボタンを探しています...");
  
  const rowSelectors = [
    'text="デフォルトのストアの掲載情報"',
    'text="Default store listing"',
    'tr:has-text("デフォルト")',
    'tr:has-text("デフォルトのストア")'
  ];

  for (const rowSelector of rowSelectors) {
    try {
      const row = await page.locator(rowSelector).first();
      if (await row.isVisible()) {
        console.log(`✅ デフォルトストア行を発見: ${rowSelector}`);
        
        // Same arrow button patterns as app list
        const arrowSelectors = [
          'button[aria-label*="表示"]',
          'button.mdc-icon-button',
          'button[type="submit"]',
          'button:has(i:has-text("arrow_right_alt"))',
          'button:has(material-icon)',
          'i.material-icon-i:has-text("arrow_right_alt")',
          'material-icon:has(i:has-text("arrow_right_alt"))',
          'button, [role="button"], i[class*="arrow"], material-icon'
        ];
        
        for (const arrowSelector of arrowSelectors) {
          try {
            const arrow = await row.locator(arrowSelector).first();
            if (await arrow.isVisible()) {
              console.log(`✅ 行内の矢印ボタンを発見: ${arrowSelector}`);
              
              // Try to click the arrow itself first
              try {
                await arrow.click();
                await page.waitForLoadState("networkidle");
                return;
              } catch (clickError) {
                // If clicking fails, try clicking its parent
                console.log(`🔄 矢印直接クリック失敗、親要素を試行中...`);
                const clickableParent = await arrow.locator('xpath=ancestor::*[self::a or self::button or @role="button"]').first();
                if (await clickableParent.isVisible()) {
                  await clickableParent.click();
                  await page.waitForLoadState("networkidle");
                  return;
                }
              }
            }
          } catch (e) {
            // Continue to next arrow selector
          }
        }
      }
    } catch (e) {
      // Continue to next row selector
    }
  }
  
  console.log("❌ デフォルトストア掲載情報の矢印が見つかりません。手動でクリックしてEnterを押してください...");
  await page.screenshot({ path: "step4-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function updateDescription(page) {
  await page.waitForTimeout(2000); // Wait for form to load
  
  const selectors = [
    'textarea[aria-label*="簡単な説明"]',
    'textarea[aria-label*="Short description"]',
    'input[aria-label*="簡単な説明"]',
    'textarea[placeholder*="簡単"]',
    'textarea'
  ];

  for (const selector of selectors) {
    try {
      const field = await page.locator(selector).first();
      if (await field.isVisible()) {
        console.log(`✅ 説明フィールドを発見`);
        await field.click();
        await field.fill('desc');
        console.log("📝 説明を 'desc' に更新しました");
        return;
      }
    } catch (e) {
      // Continue
    }
  }
  
  console.log("❌ 説明フィールドが見つかりません。手動で 'desc' を入力してEnterを押してください...");
  await page.screenshot({ path: "step5-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function saveChanges(page) {
  console.log("🔍 保存ボタンを探しています（未公開として保存は避ける）...");
  
  // Look for specific save buttons, avoiding "未公開として保存"
  const saveSelectors = [
    'button:has-text("保存"):not(:has-text("未公開"))',
    'button:has-text("Save"):not(:has-text("Draft"))',
    'button[type="submit"]:not(:has-text("未公開")):not(:has-text("Draft"))',
    'button:has-text("変更を保存")',
    'button:has-text("Save changes")'
  ];

  for (const selector of saveSelectors) {
    try {
      const button = await page.locator(selector).first();
      if (await button.isVisible()) {
        const buttonText = await button.textContent();
        console.log(`✅ 保存ボタンを発見: "${buttonText?.trim()}"`);
        
        // Double check it's not a draft save button
        if (!buttonText?.includes('未公開') && !buttonText?.includes('Draft')) {
          await button.click();
          await page.waitForLoadState("networkidle");
          console.log("💾 変更を保存しました");
          return;
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Fallback: look for any save button and let user decide
  const fallbackSelectors = [
    'button:has-text("保存")',
    'button:has-text("Save")',
    'button[type="submit"]'
  ];

  console.log("🔍 フォールバック: 利用可能な保存ボタンを確認中...");
  for (const selector of fallbackSelectors) {
    try {
      const buttons = await page.locator(selector).all();
      for (const button of buttons) {
        if (await button.isVisible()) {
          const buttonText = await button.textContent();
          console.log(`📋 利用可能な保存ボタン: "${buttonText?.trim()}"`);
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  console.log("❌ 保存ボタンが見つかりません。手動で保存してEnterを押してください...");
  await page.screenshot({ path: "step6-debug.png" });
  await new Promise((resolve) => {
    process.stdin.once('data', () => resolve());
  });
}

async function getFirstAppId(page) {
  console.log("🔍 アプリIDを抽出中...");
  
  try {
    // Method 1: Look for app links in the app list
    const appLinkSelectors = [
      'tbody tr:first-child a[href*="/app/"]',
      'tr:first-child a[href*="/app/"]',
      '.app-row:first-child a[href*="/app/"]',
      'a[href*="/app/"]:first'
    ];

    for (const selector of appLinkSelectors) {
      try {
        const appLink = await page.locator(selector).first();
        if (await appLink.isVisible()) {
          const href = await appLink.getAttribute('href');
          if (href) {
            console.log("🔗 アプリリンクを発見:", href);
            const appIdMatch = href.match(/\/app\/(\d+)/);
            if (appIdMatch && appIdMatch[1]) {
              console.log("✅ アプリIDを抽出:", appIdMatch[1]);
              return appIdMatch[1];
            }
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Method 2: Check current URL if we're already on an app page
    const currentUrl = page.url();
    const urlAppIdMatch = currentUrl.match(/\/app\/(\d+)/);
    if (urlAppIdMatch && urlAppIdMatch[1]) {
      console.log("✅ 現在のURLからアプリIDを抽出:", urlAppIdMatch[1]);
      return urlAppIdMatch[1];
    }

    // Method 3: Try to extract from any href attributes on the page
    console.log("🔍 ページ内の全アプリリンクを検索中...");
    const allLinks = await page.locator('a[href*="/app/"]').all();
    console.log(`📋 ${allLinks.length} 個のアプリリンクを発見`);
    
    if (allLinks.length > 0) {
      const href = await allLinks[0].getAttribute('href');
      if (href) {
        const appIdMatch = href.match(/\/app\/(\d+)/);
        if (appIdMatch && appIdMatch[1]) {
          console.log("✅ 最初のアプリリンクからIDを抽出:", appIdMatch[1]);
          return appIdMatch[1];
        }
      }
    }

    console.log("❌ アプリIDが見つかりませんでした");
    return null;

  } catch (error) {
    console.error("❌ アプリID抽出エラー:", error);
    return null;
  }
}

async function performSimplifiedWorkflow(page) {
  try {
    console.log("📋 簡略化ワークフローを開始...");
    console.log("✅ ストア掲載情報ページに直接アクセス済み");
    
    // Take initial screenshot
    await page.screenshot({ path: "simplified-workflow-start.png" });
    console.log("📸 開始スクリーンショット: simplified-workflow-start.png");
    
    // Step 1: Update description to 'desc'
    console.log("\n1️⃣ 簡単な説明を 'desc' に更新...");
    await updateDescription(page);
    
    // Step 2: Save changes
    console.log("\n2️⃣ 変更を保存...");
    await saveChanges(page);
    
    // Step 3: Take final screenshot
    console.log("\n3️⃣ 最終スクリーンショット撮影...");
    await page.screenshot({ path: "simplified-workflow-complete.png" });
    console.log("📸 完了スクリーンショット: simplified-workflow-complete.png");
    
    console.log("🎉 簡略化ワークフローが完了しました！");
    
  } catch (error) {
    console.error("❌ 簡略化ワークフロー実行中にエラー:", error);
    throw error;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 プロセスを終了します...');
  process.exit(0);
});

simpleManualLogin();