const puppeteer = require('puppeteer');
const { EventEmitter } = require('events');
require('dotenv').config();

class StealthMeetBot extends EventEmitter {
  constructor(botId, meetingId, meetingUrl) {
    super();
    this.botId = botId;
    this.meetingId = meetingId;
    this.meetingUrl = meetingUrl;
    this.browser = null;
    this.page = null;
    this.isActive = false;
    
    console.log(`🤖 Stealth Bot created: ${botId} for meeting ${meetingId}`);
  }

  async start() {
    try {
      console.log(`🚀 Starting stealth bot for meeting: ${this.meetingId}`);
      
      // Usar perfil de usuario real de Chrome
      const userDataDir = './bot-user-data-clean'; // Usar el directorio existente
      
      // Launch browser con perfil de usuario
      this.browser = await puppeteer.launch({
        headless: false,
        userDataDir: userDataDir,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--allow-running-insecure-content',
          '--autoplay-policy=no-user-gesture-required',
          '--disable-web-security',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-extensions-except=' + process.cwd() + '\\..\\chrome-extension',
          '--load-extension=' + process.cwd() + '\\..\\chrome-extension'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Hacer que el navegador parezca real
      await this.makeItLookReal();
      
      console.log(`🌐 Going to meeting: ${this.meetingUrl}`);
      
      // Ir primero a Google para establecer cookies
      await this.page.goto('https://accounts.google.com', { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Ahora ir a la reunión
      await this.page.goto(this.meetingUrl, { waitUntil: 'networkidle0' });
      
      // Esperar mucho más tiempo para que todo cargue
      console.log('⏳ Waiting for Google Meet to fully load...');
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      // Intentar múltiples enfoques para unirse
      await this.attemptToJoinWithMultipleStrategies();
      
      this.isActive = true;
      console.log(`✅ Stealth bot joined meeting: ${this.meetingId}`);
      this.emit('joined', { meetingId: this.meetingId });
      
    } catch (error) {
      console.error(`❌ Stealth bot failed:`, error);
      this.emit('error', error);
      await this.stop();
    }
  }

  async makeItLookReal() {
    // User agent real
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Viewport normal
    await this.page.setViewport({ width: 1366, height: 768 });
    
    // Ocultar que es Puppeteer
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      
      // Override getUserMedia
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: () => {
            return Promise.resolve(new MediaStream([
              // Fake video track
              Object.assign(Object.create(MediaStreamTrack.prototype), {
                kind: 'video',
                id: 'fake-video-track',
                label: 'fake-video-track',
                enabled: true,
                muted: false,
                readyState: 'live'
              }),
              // Fake audio track
              Object.assign(Object.create(MediaStreamTrack.prototype), {
                kind: 'audio',
                id: 'fake-audio-track',
                label: 'fake-audio-track',
                enabled: true,
                muted: false,
                readyState: 'live'
              })
            ]));
          },
          enumerateDevices: () => Promise.resolve([
            {
              deviceId: 'fake-camera-id',
              kind: 'videoinput',
              label: 'FaceTime HD Camera',
              groupId: 'fake-group-video'
            },
            {
              deviceId: 'fake-mic-id',
              kind: 'audioinput',
              label: 'Internal Microphone',
              groupId: 'fake-group-audio'
            }
          ])
        }
      });
    });
    
    // Permisos
    const context = this.browser.defaultBrowserContext();
    await context.overridePermissions(this.meetingUrl, [
      'microphone', 
      'camera', 
      'notifications',
      'geolocation'
    ]);
  }

  async attemptToJoinWithMultipleStrategies() {
    console.log('🚪 Attempting to join with multiple strategies...');
    
    // Estrategia 1: Buscar y hacer clic en cualquier botón prominente
    await this.strategy1_ClickProminentButton();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Estrategia 2: Simular interacción humana
    await this.strategy2_HumanLikeInteraction();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Estrategia 3: Usar keyboard shortcuts
    await this.strategy3_KeyboardShortcuts();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Estrategia 4: Direct DOM manipulation
    await this.strategy4_DirectDOMManipulation();
  }

  async strategy1_ClickProminentButton() {
    try {
      console.log('📋 Strategy 1: Looking for prominent buttons...');
      
      const buttons = await this.page.$$('button, div[role="button"]');
      console.log(`Found ${buttons.length} buttons`);
      
      for (const button of buttons) {
        try {
          const text = await button.evaluate(el => el.textContent?.toLowerCase() || '');
          const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label')?.toLowerCase() || '');
          
          if (text.includes('join') || text.includes('unirse') || 
              ariaLabel.includes('join') || ariaLabel.includes('unirse')) {
            console.log('🔘 Found potential join button:', text || ariaLabel);
            await button.click();
            return;
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (error) {
      console.log('⚠️ Strategy 1 failed:', error.message);
    }
  }

  async strategy2_HumanLikeInteraction() {
    try {
      console.log('👤 Strategy 2: Human-like interaction...');
      
      // Mover el mouse alrededor
      await this.page.mouse.move(100, 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.page.mouse.move(500, 300);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hacer clic en el centro de la pantalla
      await this.page.mouse.click(683, 384);
      
      // Presionar Tab para navegar
      await this.page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Presionar Enter
      await this.page.keyboard.press('Enter');
      
    } catch (error) {
      console.log('⚠️ Strategy 2 failed:', error.message);
    }
  }

  async strategy3_KeyboardShortcuts() {
    try {
      console.log('⌨️ Strategy 3: Keyboard shortcuts...');
      
      // Ctrl+D para alternar cámara (Google Meet shortcut)
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyE');
      await this.page.keyboard.up('Control');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ctrl+E para alternar micrófono
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyD');
      await this.page.keyboard.up('Control');
      
    } catch (error) {
      console.log('⚠️ Strategy 3 failed:', error.message);
    }
  }

  async strategy4_DirectDOMManipulation() {
    try {
      console.log('🔧 Strategy 4: Direct DOM manipulation...');
      
      await this.page.evaluate(() => {
        // Buscar cualquier elemento que pueda ser un botón de join
        const allElements = document.querySelectorAll('*');
        
        for (const element of allElements) {
          const text = element.textContent?.toLowerCase() || '';
          const onclick = element.getAttribute('onclick') || '';
          
          if (text.includes('join') || text.includes('unirse') || 
              onclick.includes('join') || element.classList.toString().includes('join')) {
            console.log('🎯 Direct DOM click on:', element);
            element.click();
            break;
          }
        }
        
        // También intentar disparar eventos
        const event = new Event('click', { bubbles: true });
        document.dispatchEvent(event);
      });
      
    } catch (error) {
      console.log('⚠️ Strategy 4 failed:', error.message);
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
      
      console.log(`🛑 Stealth bot stopped: ${this.botId}`);
      this.emit('disconnected');
      
    } catch (error) {
      console.error('❌ Error stopping stealth bot:', error);
    }
  }

  getStatus() {
    return {
      botId: this.botId,
      meetingId: this.meetingId,
      isActive: this.isActive,
      status: this.isActive ? 'active' : 'inactive',
      type: 'stealth-puppeteer'
    };
  }
}

module.exports = StealthMeetBot;
