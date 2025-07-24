/**
 * Chrome Extension Bot - Se ejecuta dentro del contexto de Google Meet
 * Este enfoque es más confiable porque opera desde dentro de la página
 */

class ChromeExtensionBot {
  constructor(meetingId) {
    this.meetingId = meetingId;
    this.isActive = false;
    this.joinAttempts = 0;
    this.maxAttempts = 5;
    
    console.log('🤖 Chrome Extension Bot initialized for:', meetingId);
  }

  async start() {
    try {
      console.log('🚀 Starting Chrome Extension Bot...');
      
      // Esperar a que la página cargue
      await this.waitForMeetingToLoad();
      
      // Intentar unirse automáticamente
      await this.attemptToJoin();
      
      // Configurar observadores para mantener la conexión
      this.setupMeetingObservers();
      
      this.isActive = true;
      console.log('✅ Chrome Extension Bot active');
      
      // Notificar al servidor
      this.notifyServer('bot-joined');
      
    } catch (error) {
      console.error('❌ Chrome Extension Bot error:', error);
      this.notifyServer('bot-error', error.message);
    }
  }

  async waitForMeetingToLoad() {
    return new Promise((resolve) => {
      const checkForMeeting = () => {
        // Verificar si estamos en una reunión de Google Meet
        const isMeetPage = window.location.hostname === 'meet.google.com';
        const hasJoinButton = document.querySelector('[jsname="Qx7uuf"]') || 
                             document.querySelector('[data-call-to-action="join"]');
        
        if (isMeetPage && (hasJoinButton || document.querySelector('[data-call-state]'))) {
          console.log('📅 Google Meet page detected');
          resolve();
        } else {
          setTimeout(checkForMeeting, 1000);
        }
      };
      
      checkForMeeting();
    });
  }

  async attemptToJoin() {
    console.log('🚪 Attempting to join meeting...');
    
    while (this.joinAttempts < this.maxAttempts && !this.isActive) {
      this.joinAttempts++;
      
      // Buscar botón de unirse
      const joinButton = this.findJoinButton();
      
      if (joinButton) {
        console.log(`🔘 Found join button (attempt ${this.joinAttempts})`);
        
        // Hacer clic en el botón
        joinButton.click();
        
        // Esperar un poco
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar si nos unimos exitosamente
        if (this.isInMeeting()) {
          console.log('✅ Successfully joined meeting');
          
          // Apagar cámara y micrófono
          await this.toggleMediaDevices();
          return;
        }
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (!this.isInMeeting()) {
      throw new Error('Could not join meeting after multiple attempts');
    }
  }

  findJoinButton() {
    // Múltiples selectores para encontrar el botón de unirse
    const selectors = [
      '[jsname="Qx7uuf"]',
      '[data-call-to-action="join"]',
      'button[aria-label*="Join"]',
      'button[aria-label*="Unirse"]'
    ];
    
    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button && button.offsetParent !== null) { // Verificar que sea visible
        return button;
      }
    }
    
    // Buscar por texto
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
    return buttons.find(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('join') || text.includes('unirse') || 
             text.includes('entrar') || text.includes('participar');
    });
  }

  isInMeeting() {
    // Verificar si estamos dentro de la reunión
    return document.querySelector('[data-call-state]') || 
           document.querySelector('[data-meeting-title]') ||
           document.querySelector('[aria-label*="Leave call"]') ||
           document.querySelector('[aria-label*="Salir de la llamada"]');
  }

  async toggleMediaDevices() {
    console.log('🔇 Turning off camera and microphone...');
    
    // Buscar botones de cámara y micrófono
    const mediaButtons = document.querySelectorAll('[role="button"]');
    
    for (const button of mediaButtons) {
      const ariaLabel = button.getAttribute('aria-label') || '';
      
      if (ariaLabel.toLowerCase().includes('camera') || 
          ariaLabel.toLowerCase().includes('cámara') ||
          ariaLabel.toLowerCase().includes('microphone') || 
          ariaLabel.toLowerCase().includes('micrófono')) {
        
        // Verificar si está encendido (generalmente indica color o estado)
        const isOn = button.getAttribute('aria-pressed') === 'true' ||
                     button.classList.contains('on') ||
                     !button.classList.contains('off');
        
        if (isOn) {
          console.log('🔇 Turning off:', ariaLabel);
          button.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  }

  setupMeetingObservers() {
    // Observar cambios en la página para mantener el bot activo
    const observer = new MutationObserver((mutations) => {
      // Verificar si seguimos en la reunión
      if (!this.isInMeeting()) {
        console.log('⚠️ Lost connection to meeting');
        this.notifyServer('bot-disconnected');
        this.isActive = false;
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Heartbeat para mantener la conexión
    setInterval(() => {
      if (this.isActive && this.isInMeeting()) {
        this.notifyServer('bot-heartbeat');
      }
    }, 30000); // Cada 30 segundos
  }

  notifyServer(event, data = {}) {
    // Enviar eventos al servidor a través de la extensión
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'bot-event',
        event: event,
        meetingId: this.meetingId,
        data: data
      });
    }
  }

  stop() {
    this.isActive = false;
    console.log('🛑 Chrome Extension Bot stopped');
    this.notifyServer('bot-disconnected');
  }
}

// Auto-inicializar si estamos en Google Meet
if (window.location.hostname === 'meet.google.com') {
  // Esperar un poco para que la página cargue
  setTimeout(() => {
    const meetingId = window.location.pathname.split('/').pop();
    const bot = new ChromeExtensionBot(meetingId);
    
    // Inicializar bot si recibe instrucción
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'start-extension-bot') {
        bot.start();
        sendResponse({ success: true });
      } else if (request.action === 'stop-extension-bot') {
        bot.stop();
        sendResponse({ success: true });
      }
    });
    
    console.log('🤖 Chrome Extension Bot ready');
  }, 2000);
}
