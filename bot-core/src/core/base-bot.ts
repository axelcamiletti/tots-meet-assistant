import { Browser, Page } from 'playwright';
import { BotConfig, MeetingSession } from '../types/bot.types';
import { BrowserManager } from './browser-manager';
import { SessionManager } from './session-manager';
import { EventEmitter } from 'events';

export abstract class BaseBot extends EventEmitter {
  protected browserManager: BrowserManager;
  protected sessionManager: SessionManager;
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  private isRunning: boolean = false;

  constructor(protected config: BotConfig) {
    super();
    this.browserManager = new BrowserManager(config);
    this.sessionManager = new SessionManager();
    
    console.log(`🤖 ${this.config.botName} inicializando...`);
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Iniciando navegador...');
      
      // Inicializar navegador
      const { browser, page } = await this.browserManager.initialize();
      this.browser = browser;
      this.page = page;

      // Crear sesión
      const session = this.sessionManager.createSession(this.config.meetingUrl);
      this.emit('sessionCreated', session);

      // Unirse a la reunión según la plataforma
      await this.joinMeeting();

      // Mantener la sesión activa
      this.isRunning = true;
      this.emit('started');
      console.log('✅ Bot iniciado correctamente');

    } catch (error) {
      console.error('❌ Error iniciando el bot:', error);
      await this.cleanup();
      this.emit('error', error);
      throw error;
    }
  }

  abstract joinMeeting(): Promise<void>;

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.endSession();
  }

  isActive(): boolean {
    return this.isRunning;
  }

  protected async endSession(): Promise<void> {
    const session = this.sessionManager.getCurrentSession();
    if (session) {
      this.sessionManager.endSession();
      console.log(`📋 Sesión finalizada: ${session.id}`);
      this.emit('sessionEnded', session);
    }

    await this.cleanup();
  }

  protected async cleanup(): Promise<void> {
    console.log('🧹 Limpiando recursos...');
    
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('✅ Recursos liberados');
      this.emit('cleanup');
    } catch (error) {
      console.error('Error en cleanup:', error);
    }
  }

  getSession(): MeetingSession | null {
    return this.sessionManager.getCurrentSession();
  }

  async getStatus(): Promise<{ status: string; session: MeetingSession | null }> {
    const session = this.sessionManager.getCurrentSession();
    return {
      status: session?.status || 'not_started',
      session
    };
  }
}
