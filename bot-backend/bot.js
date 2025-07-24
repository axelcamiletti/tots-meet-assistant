const puppeteer = require('puppeteer');
const { EventEmitter } = require('events');
require('dotenv').config();

class MeetBot extends EventEmitter {
  constructor(botId, meetingId, meetingUrl) {
    super();
    this.botId = botId;
    this.meetingId = meetingId;
    this.meetingUrl = meetingUrl;
    this.browser = null;
    this.page = null;
    this.isActive = false;
    
    console.log(`🤖 Bot created: ${botId} for meeting ${meetingId}`);
  }

  async start() {
    try {
      console.log(`🚀 Starting bot for meeting: ${this.meetingId}`);
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--allow-running-insecure-content',
          '--autoplay-policy=no-user-gesture-required',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--enable-fake-ui-for-media-stream',
          '--allow-file-access-from-files',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-client-side-phishing-detection',
          '--disable-crash-reporter',
          '--disable-oopr-debug-crash-dump',
          '--no-crash-upload',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-first-run',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-back-forward-cache',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-sync',
          '--force-fieldtrials=*BackgroundTracing/default/',
          '--enable-automation',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Disable CSP to avoid resource loading errors
      await this.page.setBypassCSP(true);
      
      // Handle console errors without crashing
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('🔍 Console error (ignored):', msg.text());
        }
      });
      
      // Handle page errors without crashing
      this.page.on('pageerror', error => {
        console.log('🔍 Page error (ignored):', error.message);
      });
      
      // Handle request failures without crashing
      this.page.on('requestfailed', request => {
        console.log('🔍 Request failed (ignored):', request.url());
      });
      
      // Override media devices BEFORE going to the page
      await this.page.evaluateOnNewDocument(() => {
        // Override getUserMedia to always return a fake stream
        Object.defineProperty(navigator, 'mediaDevices', {
          writable: true,
          value: {
            getUserMedia: () => Promise.resolve(new MediaStream()),
            enumerateDevices: () => Promise.resolve([
              {
                deviceId: 'fake-camera',
                kind: 'videoinput',
                label: 'Fake Camera',
                groupId: 'fake-group'
              },
              {
                deviceId: 'fake-mic',
                kind: 'audioinput',
                label: 'Fake Microphone',
                groupId: 'fake-group'
              }
            ])
          }
        });
      });
      
      // Give permissions
      const context = this.browser.defaultBrowserContext();
      await context.overridePermissions(this.meetingUrl, [
        'microphone', 
        'camera', 
        'notifications'
      ]);

      // Set viewport
      await this.page.setViewport({ width: 1280, height: 720 });

      console.log(`🌐 Going to meeting: ${this.meetingUrl}`);
      
      // Go to meeting with better error handling
      try {
        await this.page.goto(this.meetingUrl, { 
          waitUntil: 'domcontentloaded', // Changed from networkidle2 to be less strict
          timeout: 30000 
        });
      } catch (navigationError) {
        console.log('⚠️ Navigation warning (continuing anyway):', navigationError.message);
        // Don't throw - sometimes the page loads even with navigation errors
      }
      
      // Wait for page to load completely
      console.log('⏳ Waiting for page to load...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // Increased wait time
      
      // Try to join meeting with simple approach
      await this.joinMeetingSimple();
      
      this.isActive = true;
      console.log(`✅ Bot joined meeting: ${this.meetingId}`);
      this.emit('joined', { meetingId: this.meetingId });
      
    } catch (error) {
      console.error(`❌ Bot failed:`, error);
      this.emit('error', error);
      await this.stop();
    }
  }

  async joinMeetingSimple() {
    try {
      console.log('🚪 Trying to join meeting (simple approach)...');
      
      // Wait and let Google Meet load completely
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Log current page title to verify we're on the right page
      const title = await this.page.title();
      console.log('📄 Page title:', title);
      
      // Try to click join button - multiple approaches
      let joinSuccess = false;
      
      // Method 1: Try the main join button
      try {
        const joinButton = await this.page.$('button[jsname="Qx7uuf"]');
        if (joinButton) {
          await joinButton.click();
          console.log('✅ Clicked main join button');
          joinSuccess = true;
        }
      } catch (e1) {
        console.log('⚠️ Main join button not found, trying alternative methods...');
      }
      
      // Method 2: Look for any button with "Join" text
      if (!joinSuccess) {
        try {
          const clicked = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, div[role="button"], span[role="button"]'));
            const joinButton = buttons.find(btn => {
              const text = btn.textContent?.toLowerCase() || '';
              return text.includes('join') || text.includes('unirse') || 
                     text.includes('entrar') || text.includes('participar');
            });
            if (joinButton) {
              joinButton.click();
              return true;
            }
            return false;
          });
          if (clicked) {
            console.log('✅ Clicked join button via text search');
            joinSuccess = true;
          }
        } catch (e2) {
          console.log('⚠️ Text search method failed');
        }
      }
      
      // Method 3: Try to find and click any prominent button
      if (!joinSuccess) {
        try {
          await this.page.keyboard.press('Enter');
          console.log('✅ Pressed Enter to join');
          joinSuccess = true;
        } catch (e3) {
          console.log('⚠️ Enter key method failed');
        }
      }
      
      if (joinSuccess) {
        console.log('🎉 Join attempt completed, waiting for meeting to load...');
        // Wait after attempting to join
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Simple media toggle - just try once and don't worry if it fails
        await this.toggleMediaSimple();
      } else {
        console.log('⚠️ Could not find join button, but continuing...');
      }
      
    } catch (error) {
      console.log('⚠️ Join meeting error:', error.message);
      // Don't throw - just log and continue
    }
  }

  async toggleMediaSimple() {
    try {
      console.log('🔇 Attempting to turn off camera and mic...');
      
      // Simple approach - just try to find and click camera/mic buttons
      const mediaSelectors = [
        '[aria-label*="camera" i]',
        '[aria-label*="microphone" i]',
        '[aria-label*="cámara" i]',
        '[aria-label*="micrófono" i]'
      ];
      
      for (const selector of mediaSelectors) {
        try {
          const elements = await this.page.$$(selector);
          for (const element of elements) {
            // Only click if we can safely do so
            const isVisible = await element.isIntersectingViewport();
            if (isVisible) {
              await element.click();
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (e) {
          // Ignore individual errors
        }
      }
      
    } catch (error) {
      console.log('⚠️ Media toggle warning:', error.message);
      // Don't throw - media toggle is optional
    }
  }

  async stop() {
    try {
      this.isActive = false;
      
      if (this.page) {
        await this.page.close();
      }
      
      if (this.browser) {
        await this.browser.close();
      }
      
      console.log(`🛑 Bot stopped: ${this.botId}`);
      this.emit('disconnected');
      
    } catch (error) {
      console.error('❌ Error stopping bot:', error);
    }
  }

  getStatus() {
    return {
      botId: this.botId,
      meetingId: this.meetingId,
      isActive: this.isActive,
      status: this.isActive ? 'active' : 'inactive'
    };
  }
}

module.exports = MeetBot;
