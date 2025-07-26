import { GoogleMeetBot } from './platforms/google-meet-bot';
import { BotConfig, MeetingSession } from './types/bot.types';
import * as dotenv from 'dotenv';

dotenv.config();

export class MeetingBot {
  private platformBot: GoogleMeetBot | null = null;

  constructor(private config: BotConfig) {
    console.log('🤖 TOTS Notetaker Bot inicializando...');
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Iniciando bot...');
      
      // Detectar la plataforma de la URL y crear el bot correspondiente
      if (this.config.meetingUrl.includes('meet.google.com')) {
        await this.createGoogleMeetBot();
      } else {
        throw new Error('Plataforma de meeting no soportada');
      }

      console.log('✅ Bot iniciado correctamente');
    } catch (error) {
      console.error('❌ Error iniciando el bot:', error);
      await this.cleanup();
      throw error;
    }
  }

  private async createGoogleMeetBot(): Promise<void> {
    console.log('🎯 Creando bot para Google Meet...');
    
    this.platformBot = new GoogleMeetBot(this.config);
    
    // Configurar eventos
    this.setupEventHandlers();
    
    // Iniciar el bot
    await this.platformBot.start();
  }

  private setupEventHandlers(): void {
    if (!this.platformBot) return;

    this.platformBot.on('sessionCreated', (session) => {
      console.log(`📝 Sesión creada: ${session.id}`);
    });

    this.platformBot.on('joined', () => {
      console.log('✅ Bot unido a la reunión exitosamente');
    });

    this.platformBot.on('sessionEnded', (session) => {
      console.log(`📋 Sesión finalizada: ${session.id}`);
      this.printSessionSummary(session);
    });

    this.platformBot.on('transcriptionUpdate', (entry) => {
      console.log(`📝 [${entry.speaker}]: ${entry.text}`);
    });

    this.platformBot.on('participantsUpdate', (participants) => {
      console.log(`👥 Participantes actuales: ${participants.join(', ')}`);
    });

    this.platformBot.on('error', (error) => {
      console.error('❌ Error del bot:', error);
    });
  }

  private printSessionSummary(session: MeetingSession): void {
    if (!session.endTime) return;

    const duration = session.endTime.getTime() - session.startTime.getTime();
    console.log('\n📊 RESUMEN DE LA SESIÓN');
    console.log('========================');
    console.log(`ID: ${session.id}`);
    console.log(`Duración: ${Math.round(duration / 1000)}s`);
    console.log(`Participantes: ${session.participants.length}`);
    console.log(`Transcripciones: ${session.transcription.length}`);
    console.log('========================\n');
  }

  async stop(): Promise<void> {
    if (this.platformBot) {
      await this.platformBot.stop();
    }
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Limpiando recursos del MeetingBot...');
    
    if (this.platformBot) {
      await this.platformBot.stop();
      this.platformBot = null;
    }
    
    console.log('✅ Recursos del MeetingBot liberados');
  }

  // Métodos de acceso público
  getSession(): MeetingSession | null {
    return this.platformBot?.getSession() || null;
  }

  async getStatus(): Promise<{ status: string; session: MeetingSession | null }> {
    return this.platformBot?.getStatus() || { status: 'not_started', session: null };
  }

  async getDetailedStatus() {
    if (this.platformBot && 'getDetailedStatus' in this.platformBot) {
      return await (this.platformBot as any).getDetailedStatus();
    }
    return this.getStatus();
  }

  // Métodos de transcripción
  getTranscriptions() {
    return this.platformBot?.getTranscriptions() || [];
  }

  getTranscriptionStats() {
    return this.platformBot?.getTranscriptionStats() || null;
  }

  getTranscriptionSummary() {
    return this.platformBot?.getTranscriptionSummary() || null;
  }

  exportTranscriptionToText(): string {
    return this.platformBot?.exportTranscriptionToText() || 'No hay transcripciones disponibles';
  }

  exportTranscriptionToJSON(): string {
    return this.platformBot?.exportTranscriptionToJSON() || '[]';
  }

  async toggleTranscription(enable: boolean): Promise<void> {
    if (this.platformBot && 'toggleTranscription' in this.platformBot) {
      await (this.platformBot as any).toggleTranscription(enable);
    }
  }

  // Métodos de monitoreo
  async getParticipants(): Promise<string[]> {
    return this.platformBot?.getParticipants() || [];
  }

  async isMeetingActive(): Promise<boolean> {
    return this.platformBot?.isMeetingActive() || false;
  }

  async getMeetingInfo() {
    if (this.platformBot && 'getMeetingInfo' in this.platformBot) {
      return await (this.platformBot as any).getMeetingInfo();
    }
    return null;
  }

  async getNetworkQuality() {
    if (this.platformBot && 'getNetworkQuality' in this.platformBot) {
      return await (this.platformBot as any).getNetworkQuality();
    }
    return 'unknown';
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
      await bot.stop();
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

// Exportar tipos para uso externo
export { BotConfig, MeetingSession } from './types/bot.types';
