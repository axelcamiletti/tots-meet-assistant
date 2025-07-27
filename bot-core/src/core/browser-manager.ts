import { chromium, Browser, Page } from 'playwright';
import { BotConfig } from '../types/bot.types';

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(private config: BotConfig) {}

  async initialize(): Promise<{ browser: Browser; page: Page }> {
    console.log('🌐 Inicializando navegador...');
    
    // Configuración del navegador con stealth mejorado
    this.browser = await chromium.launch({
      headless: this.config.headless ?? true,
      slowMo: this.config.slowMo ?? 0,
      args: this.getBrowserArgs()
    });

    this.page = await this.browser.newPage();

    // Configurar User-Agent realista
    await this.configureUserAgent();
    
    // Configurar permisos
    await this.configurePermissions();
    
    // Script anti-detección
    await this.setupStealth();

    console.log('✅ Navegador configurado correctamente');
    
    return { browser: this.browser, page: this.page };
  }

  private getBrowserArgs(): string[] {
    return [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      // Permisos para micrófono y grabación:
      '--use-fake-ui-for-media-stream',
      '--allow-running-insecure-content',
      '--enable-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-dev-shm-usage',
      '--disable-field-trial-config',
      '--disable-ipc-flooding-protection',
      '--disable-extensions-except',
      '--disable-plugins-discovery',
      '--disable-default-apps',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-component-update',
      '--disable-client-side-phishing-detection',
      // Agregar permisos para Screen Capture:
      '--auto-select-desktop-capture-source=Entire screen',
      '--enable-usermedia-screen-capturing',
      '--allow-http-screen-capture'
    ];
  }

  private async configureUserAgent(): Promise<void> {
    if (!this.page) throw new Error('Page no inicializada');

    await this.page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
    });
  }

  private async configurePermissions(): Promise<void> {
    if (!this.page) throw new Error('Page no inicializada');

    const context = this.page.context();
    
    // Otorgar permisos básicos de media
    await context.grantPermissions(['microphone', 'camera'], { 
      origin: 'https://meet.google.com' 
    });

    // Configurar permisos para Screen Capture sin mock
    // Permitir que el usuario real otorgue permisos de captura de pantalla
    console.log('🎤 Permisos de micrófono configurados automáticamente');
  }

  private async setupStealth(): Promise<void> {
    if (!this.page) throw new Error('Page no inicializada');

    await this.page.addInitScript(() => {
      // Ocultar que es un navegador automatizado
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Simular plugins realistas
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Simular idiomas realistas
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Ocultar propiedades de automatización
      delete (window as any).chrome?.runtime?.onConnect;
      
      // Simular comportamiento de usuario real
      const originalQuery = window.navigator.permissions.query;
      return originalQuery({ name: 'notifications' }).then((result) => {
        const originalAddEventListener = result.addEventListener;
        result.addEventListener = function(name: string, listener: any, options?: any) {
          if (name === 'change') {
            setTimeout(() => listener({ target: { state: 'granted' } }), 100);
          }
          return originalAddEventListener.call(result, name, listener, options);
        };
        return result;
      });
      
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
