import { chromium, Browser, Page } from 'playwright';
import { GoogleMeetBot } from './platforms/google-meet';
import * as dotenv from 'dotenv';

dotenv.config();

export interface BotConfig {
  meetingUrl: string;
  botName: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  headless?: boolean;
}

export interface MeetingSession {
  id: string;
  url: string;
  startTime: Date;
  endTime?: Date;
  status: 'connecting' | 'joined' | 'recording' | 'ended' | 'error';
  participants: string[];
  transcription: string[];
}

export class MeetingBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private googleBot: GoogleMeetBot | null = null;
  private session: MeetingSession | null = null;

  constructor(private config: BotConfig) {
    console.log('🤖 TOTS Notetaker Bot inicializando...');
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Iniciando navegador...');
      
      // Configuración del navegador con stealth mejorado basado en Vexa
      this.browser = await chromium.launch({
        headless: this.config.headless ?? true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--allow-running-insecure-content',
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
          '--disable-client-side-phishing-detection'
        ]
      });

      this.page = await this.browser.newPage();

      // Configurar User-Agent realista - exacto como Vexa
      await this.page.context().addInitScript(() => {
        Object.defineProperty(navigator, 'userAgent', {
          get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
      });

      // Configurar permisos de cámara y micrófono
      const context = this.page.context();
      await context.grantPermissions(['microphone', 'camera'], { origin: 'https://meet.google.com' });

      // Script anti-detección avanzado basado en Vexa
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
              // Simular que el usuario ha dado permisos
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

      console.log('✅ Navegador iniciado correctamente');

      // Detectar la plataforma de la URL
      if (this.config.meetingUrl.includes('meet.google.com')) {
        await this.joinGoogleMeet();
      } else {
        throw new Error('Plataforma de meeting no soportada');
      }

    } catch (error) {
      console.error('❌ Error iniciando el bot:', error);
      await this.cleanup();
      throw error;
    }
  }

  async joinGoogleMeet(): Promise<void> {
    if (!this.page) throw new Error('Page no inicializada');

    console.log('🔗 Conectando a Google Meet...');
    
    this.googleBot = new GoogleMeetBot(this.page, this.config);
    
    // Crear sesión de meeting
    this.session = {
      id: this.generateSessionId(),
      url: this.config.meetingUrl,
      startTime: new Date(),
      status: 'connecting',
      participants: [],
      transcription: []
    };

    console.log(`📝 Sesión creada: ${this.session.id}`);

    try {
      await this.googleBot.join();
      this.session.status = 'joined';
      console.log('✅ Bot unido a la reunión exitosamente');

      // Comenzar a monitorear la reunión
      await this.startMeetingMonitoring();

    } catch (error) {
      this.session.status = 'error';
      console.error('❌ Error uniéndose a Google Meet:', error);
      throw error;
    }
  }

  private async startMeetingMonitoring(): Promise<void> {
    if (!this.googleBot || !this.session) return;

    console.log('👁️ Iniciando monitoreo de la reunión...');

    // Monitorear participantes cada 30 segundos
    setInterval(async () => {
      try {
        const participants = await this.googleBot!.getParticipants();
        this.session!.participants = participants;
        console.log(`👥 Participantes actuales: ${participants.join(', ')}`);
      } catch (error) {
        console.error('Error obteniendo participantes:', error);
      }
    }, 30000);

    // Monitorear si la reunión sigue activa
    setInterval(async () => {
      try {
        const isActive = await this.googleBot!.isMeetingActive();
        if (!isActive && this.session!.status !== 'ended') {
          console.log('📞 Reunión terminada');
          await this.endSession();
        }
      } catch (error) {
        console.error('Error verificando estado de la reunión:', error);
      }
    }, 10000);

    // Simular transcripción (por ahora solo logs)
    setInterval(() => {
      if (this.session && this.session.status === 'joined') {
        const mockTranscript = `[${new Date().toISOString()}] Transcripción en progreso...`;
        this.session.transcription.push(mockTranscript);
        console.log('📝 ' + mockTranscript);
      }
    }, 60000);
  }

  async endSession(): Promise<void> {
    if (this.session) {
      this.session.status = 'ended';
      this.session.endTime = new Date();
      console.log(`📋 Sesión finalizada: ${this.session.id}`);
      console.log(`⏱️ Duración: ${this.session.endTime.getTime() - this.session.startTime.getTime()}ms`);
    }

    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
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
    } catch (error) {
      console.error('Error en cleanup:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSession(): MeetingSession | null {
    return this.session;
  }

  // Método para ser llamado desde la API
  async getStatus(): Promise<{ status: string; session: MeetingSession | null }> {
    return {
      status: this.session?.status || 'not_started',
      session: this.session
    };
  }

  // Método público para detener el bot
  async stop(): Promise<void> {
    await this.endSession();
  }
}

// Función principal para testing directo
async function main() {
  const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/your-meeting-code';
  const botName = process.env.BOT_NAME || 'TOTS Notetaker';

  const config: BotConfig = {
    meetingUrl,
    botName,
    audioEnabled: false,
    videoEnabled: false,
    headless: false // Para debugging, cambiar a true en producción
  };

  const bot = new MeetingBot(config);

  try {
    await bot.start();
    
    // Mantener el bot corriendo
    process.on('SIGINT', async () => {
      console.log('\n👋 Señal de interrupción recibida, cerrando bot...');
      await bot.endSession();
      process.exit(0);
    });

    // Mantener el proceso vivo
    console.log('✅ Bot iniciado. Presiona Ctrl+C para detener.');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}
